"use client";
import { FormEvent,useCallback,useEffect,useState } from "react";

type Post={id:number;nickname:string;title:string;content:string;created_at:string};

async function readJson(response:Response){
  const text=await response.text();
  if(!text)return {} as Record<string,unknown>;
  try{return JSON.parse(text) as Record<string,unknown>;}
  catch{return {error:`서버 응답을 읽지 못했습니다. (${response.status})`};}
}

export function ShareBoard({bookSlug,bookName}:{bookSlug:string;bookName:string}){
  const [posts,setPosts]=useState<Post[]>([]);
  const [loading,setLoading]=useState(true);
  const [sending,setSending]=useState(false);
  const [message,setMessage]=useState("");
  const [nickname,setNickname]=useState("");
  const [title,setTitle]=useState("");
  const [content,setContent]=useState("");

  const loadPosts=useCallback(async()=>{
    setLoading(true);
    try{
      const response=await fetch(`/api/posts?book=${encodeURIComponent(bookSlug)}`,{cache:"no-store"});
      const json=await readJson(response);
      if(!response.ok)throw new Error(String(json.error||"게시글을 불러오지 못했습니다."));
      setPosts(Array.isArray(json.posts)?json.posts as Post[]:[]);
    }catch(error){
      setMessage(error instanceof Error?error.message:"게시글을 불러오지 못했습니다.");
    }finally{setLoading(false);}
  },[bookSlug]);

  useEffect(()=>{loadPosts();},[loadPosts]);

  async function submitPost(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const form=event.currentTarget;
    const formData=new FormData(form);
    setSending(true);setMessage("");
    try{
      const response=await fetch("/api/posts",{
        method:"POST",headers:{"content-type":"application/json"},
        body:JSON.stringify({bookSlug,nickname,title,content,website:formData.get("website")||""})
      });
      const json=await readJson(response);
      if(!response.ok)throw new Error(String(json.error||"글을 등록하지 못했습니다."));
      setTitle("");setContent("");
      setMessage("나눔 글이 등록되었습니다.");
      await loadPosts();
    }catch(error){
      setMessage(error instanceof Error?error.message:"글을 등록하지 못했습니다.");
    }finally{setSending(false);}
  }

  return (
    <div className="board-layout">
      <form className="share-form parchment-card" onSubmit={submitPost}>
        <div className="section-kicker">OPEN SHARING</div>
        <h3>{bookName} 나눔 남기기</h3>
        <p className="muted">로그인 없이 누구나 쓸 수 있습니다. 서로를 존중하는 언어로 나눠 주세요. 게시글 삭제는 관리자가 처리합니다.</p>
        <label>닉네임<input value={nickname} onChange={e=>setNickname(e.target.value)} minLength={2} maxLength={20} required placeholder="2~20자"/></label>
        <label>제목<input value={title} onChange={e=>setTitle(e.target.value)} minLength={2} maxLength={80} required placeholder="나눔 제목"/></label>
        <label>내용<textarea value={content} onChange={e=>setContent(e.target.value)} minLength={2} maxLength={4000} rows={7} required placeholder="본문에서 발견한 점, 질문, 적용을 자유롭게 남겨 보세요."/></label>
        <label className="honeypot" aria-hidden="true">웹사이트<input name="website" tabIndex={-1} autoComplete="off"/></label>
        <button className="primary-button" disabled={sending} type="submit">{sending?"등록 중…":"나눔 등록"}</button>
        {message&&<p className="form-message">{message}</p>}
      </form>

      <div className="board-stream">
        <div className="board-heading">
          <div><div className="section-kicker">COMMUNITY</div><h3>최근 나눔</h3></div>
          <button className="ghost-button" type="button" onClick={loadPosts}>새로고침</button>
        </div>
        {loading?<div className="empty-state">나눔을 불러오는 중입니다…</div>:
          posts.length?posts.map(post=>(
            <article className="post-card" key={post.id}>
              <div className="post-meta"><strong>{post.nickname}</strong><span>{new Date(post.created_at).toLocaleString("ko-KR")}</span></div>
              <h4>{post.title}</h4><p>{post.content}</p>
            </article>
          )):<div className="empty-state">첫 번째 나눔을 남겨 보세요.</div>}
      </div>
    </div>
  );
}
