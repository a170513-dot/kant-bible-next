import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata:Metadata={
  title:{default:"KANT BIBLE",template:"%s · KANT BIBLE"},
  description:"성경 66권 강의안, 문화·지리 인포그래픽, 책별 나눔 게시판"
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="ko"><body>
    <SiteHeader/>{children}
    <footer className="site-footer"><strong>KANT BIBLE</strong><span>성경 · 역사 · 문화 · 지리 · 나눔</span></footer>
  </body></html>;
}
