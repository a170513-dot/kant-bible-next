import { NextRequest,NextResponse } from "next/server";
import { hashDeletePassword,safeEqualHash } from "@/lib/password";
import { createServiceClient } from "@/lib/supabase-service";

export async function DELETE(request:NextRequest,context:{params:Promise<{id:string}>}){
  const {id}=await context.params; const numericId=Number(id);
  if(!Number.isFinite(numericId))return NextResponse.json({error:"잘못된 게시글입니다."},{status:400});
  const body=await request.json().catch(()=>null);
  const password=String(body?.deletePassword??"").trim();
  if(!password)return NextResponse.json({error:"삭제 비밀번호를 입력하세요."},{status:400});

  const supabase=createServiceClient();
  const {data:post,error}=await supabase.from("posts").select("id,delete_password_hash").eq("id",numericId).maybeSingle();
  if(error||!post?.delete_password_hash)return NextResponse.json({error:"게시글을 찾을 수 없습니다."},{status:404});
  const suppliedHash=hashDeletePassword(password);
  if(!safeEqualHash(post.delete_password_hash,suppliedHash))return NextResponse.json({error:"삭제 비밀번호가 맞지 않습니다."},{status:403});

  const {error:deleteError}=await supabase.from("posts").delete().eq("id",numericId);
  if(deleteError)return NextResponse.json({error:"게시글을 삭제하지 못했습니다."},{status:500});
  return NextResponse.json({ok:true});
}
