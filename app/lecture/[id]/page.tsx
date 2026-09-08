import Link from "next/link";
import { notFound } from "next/navigation";
import { LectureFrame } from "@/components/LectureFrame";
import { createServiceClient } from "@/lib/supabase-service";

export const dynamic="force-dynamic";

export default async function LectureViewerPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const numericId=Number(id);
  if(!Number.isFinite(numericId))notFound();

  const supabase=createServiceClient();
  const {data:lecture,error}=await supabase.from("lectures")
    .select("id,book_slug,title,storage_path,content_html,is_published")
    .eq("id",numericId).eq("is_published",true).maybeSingle();

  if(error||!lecture)notFound();

  let signedUrl:string|null=null;
  if(lecture.storage_path){
    const {data}=await supabase.storage.from("lectures").createSignedUrl(lecture.storage_path,60*60);
    signedUrl=data?.signedUrl||null;
  }

  return <main className="lecture-viewer-page">
    <div className="lecture-viewer-bar">
      <div>
        <span className="section-kicker">LECTURE VIEWER</span>
        <strong>{lecture.title}</strong>
      </div>
      <div className="viewer-actions">
        <Link className="ghost-button" href={`/bible/${lecture.book_slug}`}>← 성경책으로</Link>
        <button className="primary-button fullscreen-trigger" type="button" data-fullscreen-target="lectureFrame">
          전체화면 ⛶
        </button>
      </div>
    </div>

    <LectureFrame
      signedUrl={signedUrl}
      legacyHtml={lecture.content_html||null}
      title={lecture.title}
    />

    <script dangerouslySetInnerHTML={{__html:`
      document.addEventListener('click',function(e){
        const btn=e.target.closest('.fullscreen-trigger'); if(!btn)return;
        const frame=document.getElementById(btn.dataset.fullscreenTarget);
        if(frame&&frame.requestFullscreen)frame.requestFullscreen();
      });
    `}}/>
  </main>;
}
