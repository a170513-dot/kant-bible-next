import { createClient } from "@supabase/supabase-js";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!serviceKey)throw new Error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");

const supabase=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
const {data:lectures,error}=await supabase.from("lectures")
  .select("id,book_slug,title,content_html,source_filename,storage_path")
  .is("storage_path",null).not("content_html","is",null);
if(error)throw error;

for(const lecture of lectures||[]){
  if(!lecture.content_html)continue;
  const safe=(lecture.source_filename||`lecture-${lecture.id}.html`)
    .normalize("NFKC").replace(/[^\p{L}\p{N}._-]+/gu,"-");
  const path=`${lecture.book_slug}/${Date.now()}-${lecture.id}-${safe}`;
  const bytes=new TextEncoder().encode(lecture.content_html);

  const {error:uploadError}=await supabase.storage.from("lectures").upload(path,bytes,{
    contentType:"text/html; charset=utf-8",upsert:false
  });
  if(uploadError){console.error("업로드 실패",lecture.id,uploadError.message);continue;}

  const {error:updateError}=await supabase.from("lectures").update({
    storage_path:path,file_size:bytes.byteLength,mime_type:"text/html",content_html:null,
    updated_at:new Date().toISOString()
  }).eq("id",lecture.id);

  if(updateError){
    console.error("DB 갱신 실패",lecture.id,updateError.message);
    await supabase.storage.from("lectures").remove([path]);
    continue;
  }
  console.log("이전 완료:",lecture.id,lecture.title);
}
console.log("마이그레이션 종료");
