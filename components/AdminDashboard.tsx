"use client";

import { FormEvent,useCallback,useEffect,useMemo,useState } from "react";
import { createClient,type Session } from "@supabase/supabase-js";
import * as tus from "tus-js-client";
import { BOOKS } from "@/lib/books";
import { ResourceAdmin } from "@/components/ResourceAdmin";

type Lecture={
  id:number;book_slug:string;title:string;summary:string|null;is_published:boolean;
  source_filename:string|null;storage_path:string|null;file_size:number|null;updated_at:string;
};
type ModerationPost={
  id:number;book_slug:string;nickname:string;title:string;content:string;
  status:"visible"|"hidden";created_at:string;
};

const url=process.env.NEXT_PUBLIC_SUPABASE_URL||"";
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||"";

function safeFileName(name:string){
  const lower=name.toLowerCase();
  const ext=lower.endsWith(".htm")?"htm":"html";
  const id=typeof crypto!=="undefined"&&"randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return `lecture-${id}.${ext}`;
}

export function AdminDashboard(){
  const supabase=useMemo(()=>createClient(url,key),[]);
  const [session,setSession]=useState<Session|null>(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [checking,setChecking]=useState(true);
  const [recoveryMode,setRecoveryMode]=useState(false);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [authMessage,setAuthMessage]=useState("");
  const [lectures,setLectures]=useState<Lecture[]>([]);
  const [posts,setPosts]=useState<ModerationPost[]>([]);
  const [tab,setTab]=useState<"lectures"|"resources"|"posts">("lectures");
  const [uploadProgress,setUploadProgress]=useState(0);
  const [uploadMessage,setUploadMessage]=useState("");

  // 관리자 확인은 첫 진입 때만 로딩 화면을 사용합니다.
  // 토큰 갱신 같은 인증 이벤트마다 checking=true로 되돌리면
  // 화면 전체가 "확인 중" ↔ "콘텐츠 관리"로 반복 교체되어 스크롤이 튈 수 있습니다.
  const checkAdmin=useCallback(async(activeSession:Session|null)=>{
    setSession(activeSession);

    if(!activeSession?.user?.email){
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    try{
      const {data,error}=await supabase
        .from("admins")
        .select("email")
        .eq("email",activeSession.user.email)
        .maybeSingle();

      setIsAdmin(Boolean(data&&!error));
    }catch{
      setIsAdmin(false);
    }finally{
      setChecking(false);
    }
  },[supabase]);

  const loadAdminData=useCallback(async()=>{
    if(!isAdmin)return;
    const [lectureResult,postResult]=await Promise.all([
      supabase.from("lectures")
        .select("id,book_slug,title,summary,is_published,source_filename,storage_path,file_size,updated_at")
        .order("updated_at",{ascending:false}),
      supabase.from("posts")
        .select("id,book_slug,nickname,title,content,status,created_at")
        .order("created_at",{ascending:false}).limit(100)
    ]);
    if(!lectureResult.error)setLectures((lectureResult.data||[]) as Lecture[]);
    if(!postResult.error)setPosts((postResult.data||[]) as ModerationPost[]);
  },[isAdmin,supabase]);

  useEffect(()=>{
    let cancelled=false;

    supabase.auth.getSession().then(({data})=>{
      if(!cancelled)void checkAdmin(data.session);
    }).catch(()=>{
      if(!cancelled){
        setSession(null);
        setIsAdmin(false);
        setChecking(false);
      }
    });

    const {data:listener}=supabase.auth.onAuthStateChange((event,newSession)=>{
      if(event==="PASSWORD_RECOVERY")setRecoveryMode(true);

      if(event==="SIGNED_OUT"){
        setSession(null);
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      // INITIAL_SESSION과 TOKEN_REFRESHED는 getSession 또는 기존 상태로 충분합니다.
      // 여기서 다시 전체 관리자 확인 화면을 띄우지 않습니다.
      if(event==="SIGNED_IN"||event==="USER_UPDATED"||event==="PASSWORD_RECOVERY"){
        setTimeout(()=>{
          if(!cancelled)void checkAdmin(newSession);
        },0);
      }
    });

    return()=>{
      cancelled=true;
      listener.subscription.unsubscribe();
    };
  },[checkAdmin,supabase]);

  useEffect(()=>{loadAdminData();},[loadAdminData]);

  async function signIn(event:FormEvent){
    event.preventDefault();setAuthMessage("로그인 중…");
    const {error}=await supabase.auth.signInWithPassword({email,password});
    setAuthMessage(error?error.message:"로그인했습니다.");
  }
  async function sendReset(){
    if(!email)return setAuthMessage("이메일을 먼저 입력하세요.");
    const redirectTo=`${window.location.origin}/admin`;
    const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo});
    setAuthMessage(error?error.message:"비밀번호 재설정 메일을 보냈습니다.");
  }
  async function updatePassword(){
    if(password.length<6)return setAuthMessage("새 비밀번호는 6자 이상이어야 합니다.");
    const {error}=await supabase.auth.updateUser({password});
    if(error)return setAuthMessage(error.message);
    setRecoveryMode(false);setPassword("");setAuthMessage("비밀번호를 변경했습니다.");
  }
  async function signOut(){
    await supabase.auth.signOut();setLectures([]);setPosts([]);
  }

  async function uploadLecture(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!session)return;
    const formEl=event.currentTarget;
    const form=new FormData(formEl);
    const file=form.get("file");
    const bookSlug=String(form.get("bookSlug")||"");
    const title=String(form.get("title")||"").trim();
    const summary=String(form.get("summary")||"").trim();
    const isPublished=form.get("isPublished")==="on";

    if(!(file instanceof File)||!file.name)return setUploadMessage("HTML 파일을 선택하세요.");
    if(!/\.html?$/i.test(file.name))return setUploadMessage("HTML 또는 HTM 파일만 업로드할 수 있습니다.");
    if(file.size>50*1024*1024)return setUploadMessage("파일은 최대 50MB까지 업로드할 수 있습니다.");
    if(!bookSlug||!title)return setUploadMessage("성경책과 제목을 입력하세요.");

    setUploadMessage("업로드를 준비하고 있습니다…");setUploadProgress(0);

    // 사용자가 선택한 한글 파일명은 source_filename에 그대로 보존하고,
    // Supabase Storage에는 ASCII 안전 이름만 사용합니다.
    const objectName=`${bookSlug}/${Date.now()}-${safeFileName(file.name)}`;

    try{
      await new Promise<void>((resolve,reject)=>{
        const upload=new tus.Upload(file,{
          endpoint:`${url}/storage/v1/upload/resumable`,
          retryDelays:[0,3000,5000,10000,20000],
          headers:{authorization:`Bearer ${session.access_token}`,apikey:key},
          uploadDataDuringCreation:true,removeFingerprintOnSuccess:true,
          chunkSize:6*1024*1024,
          metadata:{bucketName:"lectures",objectName,contentType:"text/html",cacheControl:"3600"},
          onError(error){reject(error);},
          onProgress(done,total){setUploadProgress(Math.round((done/total)*100));},
          onSuccess(){resolve();}
        });
        upload.start();
      });
    }catch(error){
      return setUploadMessage(error instanceof Error?error.message:"파일 업로드에 실패했습니다.");
    }

    const {error}=await supabase.from("lectures").insert({
      book_slug:bookSlug,title,summary:summary||null,source_filename:file.name,
      storage_path:objectName,file_size:file.size,mime_type:"text/html",
      content_html:null,is_published:isPublished,updated_at:new Date().toISOString()
    });

    if(error){
      await supabase.storage.from("lectures").remove([objectName]);
      return setUploadMessage(`강의안 정보 저장 실패: ${error.message}`);
    }

    formEl.reset();setUploadProgress(100);setUploadMessage("강의안을 업로드했습니다.");
    await loadAdminData();
  }

  async function toggleLecture(lecture:Lecture){
    const {error}=await supabase.from("lectures")
      .update({is_published:!lecture.is_published,updated_at:new Date().toISOString()})
      .eq("id",lecture.id);
    if(!error)await loadAdminData();
  }
  async function deleteLecture(lecture:Lecture){
    if(!window.confirm(`"${lecture.title}" 강의안을 삭제할까요?`))return;
    if(lecture.storage_path){
      const {error:storageError}=await supabase.storage.from("lectures").remove([lecture.storage_path]);
      if(storageError)return window.alert(`파일 삭제 실패: ${storageError.message}`);
    }
    const {error}=await supabase.from("lectures").delete().eq("id",lecture.id);
    if(error)return window.alert(error.message);
    await loadAdminData();
  }
  async function changePostStatus(post:ModerationPost){
    const next=post.status==="visible"?"hidden":"visible";
    const {error}=await supabase.from("posts").update({status:next}).eq("id",post.id);
    if(!error)await loadAdminData();
  }
  async function deletePost(post:ModerationPost){
    if(!window.confirm(`"${post.title}" 게시글을 완전히 삭제할까요?`))return;
    const {error}=await supabase.from("posts").delete().eq("id",post.id);
    if(!error)await loadAdminData();
  }

  if(!url||!key)return <div className="admin-card">Supabase 환경변수가 없습니다.</div>;
  if(checking)return <div className="admin-card">관리자 상태를 확인하는 중입니다…</div>;

  if(recoveryMode)return(
    <section className="admin-card narrow-card">
      <div className="section-kicker">PASSWORD RESET</div><h2>새 비밀번호 설정</h2>
      <label>새 비밀번호<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
      <button className="primary-button" type="button" onClick={updatePassword}>새 비밀번호 저장</button>
      {authMessage&&<p className="form-message">{authMessage}</p>}
    </section>
  );

  if(!session)return(
    <form className="admin-card narrow-card" onSubmit={signIn}>
      <div className="section-kicker">ADMIN</div><h2>관리자 로그인</h2>
      <label>이메일<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
      <label>비밀번호<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>
      <div className="button-row">
        <button className="primary-button" type="submit">로그인</button>
        <button className="ghost-button" type="button" onClick={sendReset}>비밀번호 찾기</button>
      </div>
      {authMessage&&<p className="form-message">{authMessage}</p>}
    </form>
  );

  if(!isAdmin)return(
    <section className="admin-card narrow-card">
      <h2>관리자 권한이 없습니다.</h2><p>{session.user.email}</p>
      <button className="ghost-button" type="button" onClick={signOut}>로그아웃</button>
    </section>
  );

  return(
    <div className="admin-stack">
      <section className="admin-card admin-topline">
        <div><div className="section-kicker">KANT BIBLE CONTROL ROOM</div><h2>콘텐츠 관리</h2><p className="muted">{session.user.email}</p></div>
        <button className="ghost-button" type="button" onClick={signOut}>로그아웃</button>
      </section>

      <div className="admin-tabs">
        <button className={tab==="lectures"?"active":""} onClick={()=>setTab("lectures")} type="button">강의안</button>
        <button className={tab==="resources"?"active":""} onClick={()=>setTab("resources")} type="button">책별 자료</button>
        <button className={tab==="posts"?"active":""} onClick={()=>setTab("posts")} type="button">게시판 관리</button>
      </div>

      {tab==="resources" ? <ResourceAdmin session={session}/> : tab==="lectures"?<>
        <form className="admin-card" onSubmit={uploadLecture}>
          <div className="section-kicker">UPLOAD · MAX 50MB</div><h2>HTML 강의안 업로드</h2>
          <div className="form-grid">
            <label>성경책<select name="bookSlug" required>{BOOKS.map(book=><option key={book.slug} value={book.slug}>{book.testament==="OT"?"구약":"신약"} · {book.nameKo}</option>)}</select></label>
            <label>HTML 파일<input name="file" type="file" accept=".html,.htm,text/html" required/></label>
          </div>
          <label>강의 제목<input name="title" maxLength={120} required/></label>
          <label>짧은 설명<textarea name="summary" rows={3} maxLength={500}/></label>
          <label className="checkbox-row"><input name="isPublished" type="checkbox" defaultChecked/><span>업로드 즉시 공개</span></label>
          <button className="primary-button" type="submit">강의안 업로드</button>
          {uploadProgress>0&&<div className="progress-track"><span style={{width:`${uploadProgress}%`}}/></div>}
          {uploadMessage&&<p className="form-message">{uploadMessage}</p>}
        </form>

        <section className="admin-card">
          <div className="admin-section-heading"><h2>등록된 강의안</h2><button className="ghost-button" type="button" onClick={loadAdminData}>새로고침</button></div>
          <div className="manager-list">
            {lectures.map(lecture=><article className="manager-row" key={lecture.id}>
              <div><small>{lecture.book_slug}</small><strong>{lecture.title}</strong>
                <span>{lecture.source_filename||"DB 강의안"} · {lecture.file_size?`${(lecture.file_size/1024/1024).toFixed(1)}MB`:"기존 방식"}</span>
              </div>
              <div className="manager-actions">
                <span className={`status-pill ${lecture.is_published?"visible":"hidden"}`}>{lecture.is_published?"공개":"비공개"}</span>
                <button className="ghost-button" type="button" onClick={()=>toggleLecture(lecture)}>{lecture.is_published?"비공개":"공개"}</button>
                <button className="danger-button" type="button" onClick={()=>deleteLecture(lecture)}>삭제</button>
              </div>
            </article>)}
          </div>
        </section>
      </>:(
        <section className="admin-card">
          <div className="admin-section-heading"><h2>나눔 게시판 관리</h2><button className="ghost-button" type="button" onClick={loadAdminData}>새로고침</button></div>
          <div className="manager-list">
            {posts.map(post=><article className="manager-row" key={post.id}>
              <div><small>{post.book_slug} · {post.nickname}</small><strong>{post.title}</strong><span className="manager-preview">{post.content}</span></div>
              <div className="manager-actions">
                <span className={`status-pill ${post.status}`}>{post.status==="visible"?"공개":"숨김"}</span>
                <button className="ghost-button" type="button" onClick={()=>changePostStatus(post)}>{post.status==="visible"?"숨기기":"다시 공개"}</button>
                <button className="danger-button" type="button" onClick={()=>deletePost(post)}>삭제</button>
              </div>
            </article>)}
          </div>
        </section>
      )}
    </div>
  );
}
