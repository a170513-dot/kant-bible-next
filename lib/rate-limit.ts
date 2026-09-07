import "server-only";
import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

export function requestFingerprint(request:NextRequest){
  const source=(process.env.BOARD_RATE_LIMIT_SALT||process.env.SUPABASE_SERVICE_ROLE_KEY||"").trim();
  if(!source)throw new Error("게시판 속도 제한용 서버 비밀값이 설정되지 않았습니다.");

  const salt=createHash("sha256")
    .update(`kant-bible-board-rate-limit:${source}`)
    .digest("hex");

  const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip=forwarded||request.headers.get("x-real-ip")||"unknown";
  const agent=request.headers.get("user-agent")||"unknown";
  return createHash("sha256").update(`${salt}:${ip}:${agent}`).digest("hex");
}
