"use client";
import { FormEvent,useCallback,useEffect,useState } from "react";

type Post={id:number;nickname:string;title:string;content:string;created_at:string};

export function ShareBoard({bookSlug,bookName}:{bookSlug:string;bookName:string}){
  const [posts,setPosts]=useState<Post[]>([]);
  const [loading,setLoading]=useState(true);
  const [sending,setSending]=useState(false);
  const [message,setMessage]=useState("");
  const [nickname,setNickname]=useState("");
  const [title,setTitle]=useState("");
  const [content,setContent]=useState("");
  const [deletePassword,setDeletePassword]=useState("");

  const loadPosts=useCallback(async()=>{
    setLoading(true);
    try{
      const response=await fetch(`/api/posts?book=${encodeURIComponent(bookSlug)}`,{cache:"no-store"});
      const json=await response.json();
      if(!response.ok) throw new Error(json.error||"게시글을 불러오지 못했습니다.");
      setPosts(json.posts||[]);
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
        body:JSON.stringify({bookSlug,nickname,title,content,deletePassword,website:formData.get("website")||""})
      });
      const json=await response.json();
      if(!response.ok) throw new Error(json.error||"글을 등록하지 못했습니다.");
      setTitle("");setContent("");setDeletePassword("");
      setMessage("나눔 글이 등록되었습니다.");
      await loadPosts();
    }catch(error){
      setMessage(error instanceof Error?error.message:"글을 등록하지 못했습니다.");
    }finally{setSending(false);}
  }

  async function deleteMyPost(post:Post){
    const password=window.prompt(`"${post.title}" 글의 삭제 비밀번호를 입력하세요.`);
    if(!password)return;
    try{
      const response=await fetch(`/api/posts/${post.id}`,{
        method:"DELETE",headers:{"content-type":"application/json"},
        body:JSON.stringify({deletePassword:password})
      });
      const json=await response.json();
      if(!response.ok) throw new Error(json.error||"삭제하지 못했습니다.");
      await loadPosts();
    }catch(error){
      window.alert(error instanceof Error?error.message:"삭제하지 못했습니다.");
    }
  }

  return (
    <div className="board-layout">
      <form className="share-form parchment-card" onSubmit={submitPost}>
        <div className="section-kicker">OPEN SHARING</div>
        <h3>{bookName} 나눔 남기기</h3>
        <p className="muted">로그인 없이 누구나 쓸 수 있습니다. 서로를 존중하는 언어로 나눠 주세요.</p>
        <label>닉네임<input value={nickname} onChange={e=>setNickname(e.target.value)} minLength={2} maxLength={20} required placeholder="2~20자"/></label>
        <label>제목<input value={title} onChange={e=>setTitle(e.target.value)} minLength={2} maxLength={80} required placeholder="나눔 제목"/></label>
        <label>내용<textarea value={content} onChange={e=>setContent(e.target.value)} minLength={2} maxLength={4000} rows={7} required placeholder="본문에서 발견한 점, 질문, 적용을 자유롭게 남겨 보세요."/></label>
        <label>삭제 비밀번호<input value={deletePassword} onChange={e=>setDeletePassword(e.target.value)} type="password" minLength={4} maxLength={32} required placeholder="나중에 내 글을 지울 때 사용"/></label>
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
              <button className="text-button" type="button" onClick={()=>deleteMyPost(post)}>내 글 삭제</button>
            </article>
          )):<div className="empty-state">첫 번째 나눔을 남겨 보세요.</div>}
      </div>
    </div>
  );
}
