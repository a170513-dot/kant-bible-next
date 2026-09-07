import "server-only";
import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

export function requestFingerprint(request:NextRequest){
  const salt=process.env.BOARD_RATE_LIMIT_SALT;
  if(!salt) throw new Error("BOARD_RATE_LIMIT_SALT가 설정되지 않았습니다.");
  const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip=forwarded||request.headers.get("x-real-ip")||"unknown";
  const agent=request.headers.get("user-agent")||"unknown";
  return createHash("sha256").update(`${salt}:${ip}:${agent}`).digest("hex");
}
