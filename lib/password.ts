import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

export function hashDeletePassword(password:string){
  const pepper=process.env.BOARD_DELETE_PEPPER;
  if(!pepper) throw new Error("BOARD_DELETE_PEPPER가 설정되지 않았습니다.");
  return createHash("sha256").update(`${pepper}:${password}`).digest("hex");
}
export function safeEqualHash(a:string,b:string){
  const left=Buffer.from(a,"hex"), right=Buffer.from(b,"hex");
  return left.length===right.length && timingSafeEqual(left,right);
}
