import { NextResponse } from "next/server";

export async function DELETE(){
  return NextResponse.json(
    {error:"게시글 삭제는 관리자만 할 수 있습니다."},
    {status:403}
  );
}
