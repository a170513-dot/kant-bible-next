import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata:Metadata={
  title:{default:"Kant Bible",template:"%s · Kant Bible"},
  description:"성경 66권과 신구약중간사 강의안, 역사·문화·지리, 본문 연구와 매일성경 QT 나눔 아카이브"
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="ko"><body>
    <SiteHeader/>
    {children}
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <strong>Kant Bible</strong>
          <span>Scripture for a Deeper Life</span>
        </div>
        <nav className="footer-nav" aria-label="하단 메뉴">
          <Link href="/#library">성경 66권</Link>
          <Link href="/bible/intertestamental">신구약중간사</Link>
          <Link href="/qt">매일성경 QT</Link>
          <Link href="/board">나눔 게시판</Link>
          <Link href="/admin">관리자</Link>
        </nav>
        <p>말씀을 더 깊이, 세상을 더 넓게.</p>
      </div>
    </footer>
  </body></html>;
}
