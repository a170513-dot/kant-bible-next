import { NextRequest,NextResponse } from "next/server";
import { requestFingerprint } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase-service";

export const dynamic="force-dynamic";
const clean=(v:unknown)=>String(v??"").trim();

function validDate(value:string){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const parsed=new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===value;
}

export async function GET(){
  try{
    const supabase=createServiceClient();
    const {data,error}=await supabase.from("qt_posts")
      .select("id,qt_date,passage,nickname,title,content,created_at")
      .eq("status","visible")
      .order("qt_date",{ascending:false})
      .order("created_at",{ascending:false})
      .limit(100);

    if(error){
      console.error("QT list failed",error);
      return NextResponse.json({error:"QT 게시판을 불러오지 못했습니다."},{status:500});
    }
    return NextResponse.json({posts:data||[]});
  }catch(error){
    console.error("GET /api/qt failed",error);
    return NextResponse.json({error:"QT 게시판 서버 설정을 확인해야 합니다."},{status:500});
  }
}

export async function POST(request:NextRequest){
  try{
    const body=await request.json().catch(()=>null);
    if(!body)return NextResponse.json({error:"잘못된 요청입니다."},{status:400});

    const qtDate=clean(body.qtDate);
    const passage=clean(body.passage);
    const nickname=clean(body.nickname);
    const title=clean(body.title);
    const content=clean(body.content);
    const website=clean(body.website);

    if(website)return NextResponse.json({ok:true});
    if(!validDate(qtDate))return NextResponse.json({error:"QT 날짜를 확인하세요."},{status:400});
    if(passage.length<2||passage.length>80)return NextResponse.json({error:"본문은 2~80자로 입력하세요."},{status:400});
    if(nickname.length<2||nickname.length>20)return NextResponse.json({error:"닉네임은 2~20자로 입력하세요."},{status:400});
    if(title.length<2||title.length>100)return NextResponse.json({error:"제목은 2~100자로 입력하세요."},{status:400});
    if(content.length<2||content.length>6000)return NextResponse.json({error:"묵상 내용은 2~6000자로 입력하세요."},{status:400});

    const supabase=createServiceClient();
    const fingerprint=`qt:${requestFingerprint(request)}`;
    const {data:allowed,error:rateError}=await supabase.rpc("claim_board_post",{
      p_fingerprint:fingerprint,p_limit:5,p_window_minutes:60
    });
    if(rateError)return NextResponse.json({error:"게시판 보호 기능을 확인할 수 없습니다."},{status:500});
    if(!allowed)return NextResponse.json({error:"짧은 시간에 글을 너무 많이 등록했습니다. 잠시 후 다시 시도하세요."},{status:429});

    const {error}=await supabase.from("qt_posts").insert({
      qt_date:qtDate,passage,nickname,title,content,status:"visible"
    });
    if(error){
      console.error("QT insert failed",error);
      return NextResponse.json({error:"QT를 등록하지 못했습니다."},{status:500});
    }

    return NextResponse.json({ok:true},{status:201});
  }catch(error){
    console.error("POST /api/qt failed",error);
    return NextResponse.json({error:"QT 게시판 서버 설정을 확인해야 합니다."},{status:500});
  }
}
