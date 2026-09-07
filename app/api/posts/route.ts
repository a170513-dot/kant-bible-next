import { NextRequest,NextResponse } from "next/server";
import { BOOK_MAP } from "@/lib/books";
import { requestFingerprint } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase-service";

export const dynamic="force-dynamic";
const clean=(v:unknown)=>String(v??"").trim();

export async function GET(request:NextRequest){
  try{
    const book=clean(request.nextUrl.searchParams.get("book"));
    if(!BOOK_MAP.has(book))return NextResponse.json({error:"잘못된 성경책입니다."},{status:400});
    const supabase=createServiceClient();
    const {data,error}=await supabase.from("posts").select("id,nickname,title,content,created_at")
      .eq("book_slug",book).eq("status","visible").order("created_at",{ascending:false}).limit(50);
    if(error)return NextResponse.json({error:"게시글을 불러오지 못했습니다."},{status:500});
    return NextResponse.json({posts:data||[]});
  }catch(error){
    console.error("GET /api/posts failed",error);
    return NextResponse.json({error:"게시판 서버 설정을 확인해야 합니다."},{status:500});
  }
}

export async function POST(request:NextRequest){
  try{
    const body=await request.json().catch(()=>null);
    if(!body)return NextResponse.json({error:"잘못된 요청입니다."},{status:400});
    const bookSlug=clean(body.bookSlug),nickname=clean(body.nickname),title=clean(body.title),
          content=clean(body.content),website=clean(body.website);
    if(website)return NextResponse.json({ok:true});
    if(!BOOK_MAP.has(bookSlug))return NextResponse.json({error:"잘못된 성경책입니다."},{status:400});
    if(nickname.length<2||nickname.length>20)return NextResponse.json({error:"닉네임은 2~20자로 입력하세요."},{status:400});
    if(title.length<2||title.length>80)return NextResponse.json({error:"제목은 2~80자로 입력하세요."},{status:400});
    if(content.length<2||content.length>4000)return NextResponse.json({error:"내용은 2~4000자로 입력하세요."},{status:400});

    const supabase=createServiceClient();
    const fingerprint=requestFingerprint(request);
    const {data:allowed,error:rateError}=await supabase.rpc("claim_board_post",{p_fingerprint:fingerprint,p_limit:5,p_window_minutes:60});
    if(rateError)return NextResponse.json({error:"게시판 보호 기능을 확인할 수 없습니다."},{status:500});
    if(!allowed)return NextResponse.json({error:"짧은 시간에 글을 너무 많이 등록했습니다. 잠시 후 다시 시도하세요."},{status:429});

    const {error}=await supabase.from("posts").insert({
      book_slug:bookSlug,nickname,title,content,delete_password_hash:"admin-only",status:"visible"
    });
    if(error){
      console.error("Post insert failed",error);
      return NextResponse.json({error:"글을 등록하지 못했습니다."},{status:500});
    }
    return NextResponse.json({ok:true},{status:201});
  }catch(error){
    console.error("POST /api/posts failed",error);
    return NextResponse.json({error:"게시판 서버 설정을 확인해야 합니다."},{status:500});
  }
}
