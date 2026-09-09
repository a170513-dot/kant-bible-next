"use client";

import { FormEvent,useCallback,useEffect,useState } from "react";
import styles from "./QtBoard.module.css";

type QtPost={
  id:number;
  qt_date:string;
  passage:string;
  nickname:string;
  title:string;
  content:string;
  created_at:string;
};

async function readJson(response:Response){
  const text=await response.text();
  if(!text)return {} as Record<string,unknown>;
  try{return JSON.parse(text) as Record<string,unknown>;}
  catch{return {error:`서버 응답을 읽지 못했습니다. (${response.status})`};}
}

function todayLocal(){
  const d=new Date();
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,"0");
  const day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}

function shortDate(value:string){
  const [y,m,d]=value.split("-");
  return y&&m&&d?`${y}.${m}.${d}`:value;
}

export function QtBoard(){
  const [posts,setPosts]=useState<QtPost[]>([]);
  const [loading,setLoading]=useState(true);
  const [sending,setSending]=useState(false);
  const [message,setMessage]=useState("");
  const [qtDate,setQtDate]=useState("");
  const [passage,setPassage]=useState("");
  const [nickname,setNickname]=useState("");
  const [title,setTitle]=useState("");
  const [content,setContent]=useState("");

  const loadPosts=useCallback(async(silent=false)=>{
    if(!silent)setLoading(true);
    try{
      const response=await fetch("/api/qt",{cache:"no-store"});
      const json=await readJson(response);
      if(!response.ok)throw new Error(String(json.error||"QT 나눔을 불러오지 못했습니다."));
      setPosts(Array.isArray(json.posts)?json.posts as QtPost[]:[]);
      if(!silent)setMessage("");
    }catch(error){
      setMessage(error instanceof Error?error.message:"QT 나눔을 불러오지 못했습니다.");
    }finally{
      if(!silent)setLoading(false);
    }
  },[]);

  useEffect(()=>{
    setQtDate(todayLocal());
    void loadPosts();

    const refresh=()=>{
      if(document.visibilityState==="visible")void loadPosts(true);
    };
    const timer=window.setInterval(refresh,30000);
    window.addEventListener("focus",refresh);
    document.addEventListener("visibilitychange",refresh);
    return()=>{
      window.clearInterval(timer);
      window.removeEventListener("focus",refresh);
      document.removeEventListener("visibilitychange",refresh);
    };
  },[loadPosts]);

  async function submitPost(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const form=event.currentTarget;
    const data=new FormData(form);
    setSending(true);setMessage("");
    try{
      const response=await fetch("/api/qt",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({
          qtDate,passage,nickname,title,content,
          website:data.get("website")||""
        })
      });
      const json=await readJson(response);
      if(!response.ok)throw new Error(String(json.error||"QT를 등록하지 못했습니다."));
      setPassage("");setTitle("");setContent("");
      setMessage("QT 나눔이 등록되었습니다.");
      await loadPosts(true);
    }catch(error){
      setMessage(error instanceof Error?error.message:"QT를 등록하지 못했습니다.");
    }finally{setSending(false);}
  }

  return <div className={styles.wrap}>
    <form className={styles.form} onSubmit={submitPost}>
      <div className="section-kicker">DAILY QUIET TIME</div>
      <h2>오늘의 QT 나누기</h2>
      <p>로그인 없이 누구나 올릴 수 있습니다. 본문과 묵상, 적용을 편안하게 나눠 주세요.</p>

      <div className={styles.formGrid}>
        <label>QT 날짜<input type="date" value={qtDate} onChange={e=>setQtDate(e.target.value)} required/></label>
        <label>닉네임<input value={nickname} onChange={e=>setNickname(e.target.value)} minLength={2} maxLength={20} placeholder="2~20자" required/></label>
      </div>
      <label>매일성경 본문<input value={passage} onChange={e=>setPassage(e.target.value)} minLength={2} maxLength={80} placeholder="예: 누가복음 9:1-17" required/></label>
      <label>제목<input value={title} onChange={e=>setTitle(e.target.value)} minLength={2} maxLength={100} placeholder="오늘 묵상의 제목" required/></label>
      <label>묵상과 적용<textarea value={content} onChange={e=>setContent(e.target.value)} minLength={2} maxLength={6000} rows={8} placeholder="본문에서 발견한 점, 마음에 남은 말씀, 오늘의 적용을 적어 주세요." required/></label>
      <label className="honeypot" aria-hidden="true">웹사이트<input name="website" tabIndex={-1} autoComplete="off"/></label>
      <button className="primary-button" disabled={sending} type="submit">{sending?"등록 중…":"QT 등록"}</button>
      {message&&<p className="form-message">{message}</p>}
    </form>

    <section className={styles.board}>
      <div className={styles.boardTop}>
        <div>
          <div className="section-kicker">QT BOARD</div>
          <h2>매일성경 본문 QT</h2>
        </div>
        <button className="ghost-button" type="button" onClick={()=>void loadPosts()}>새로고침</button>
      </div>

      <div className={styles.tableHead} aria-hidden="true">
        <span>날짜</span><span>본문</span><span>제목</span><span>작성자</span>
      </div>

      <div className={styles.rows}>
        {loading?<div className="empty-state">QT 나눔을 불러오는 중입니다…</div>:
        posts.length?posts.map(post=>(
          <details className={styles.row} key={post.id}>
            <summary>
              <span className={styles.date}>{shortDate(post.qt_date)}</span>
              <span className={styles.passage}>{post.passage}</span>
              <strong className={styles.title}>{post.title}</strong>
              <span className={styles.nickname}>{post.nickname}</span>
            </summary>
            <div className={styles.rowBody}>
              <div className={styles.meta}>{shortDate(post.qt_date)} · {post.passage} · {post.nickname}</div>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <time>{new Date(post.created_at).toLocaleString("ko-KR")}</time>
            </div>
          </details>
        )):<div className="empty-state">아직 등록된 QT가 없습니다. 첫 묵상을 남겨 보세요.</div>}
      </div>
    </section>
  </div>;
}
