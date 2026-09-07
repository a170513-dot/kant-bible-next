import { AdminDashboard } from "@/components/AdminDashboard";
export default function AdminPage(){
  return <main className="simple-page admin-page">
    <section className="page-title parchment-hero compact">
      <div className="section-kicker">PRIVATE CONTROL ROOM</div>
      <h1>관리자</h1><p>강의안 업로드, 공개 설정, 게시판 관리를 한곳에서 처리합니다.</p>
    </section>
    <section className="page-section"><AdminDashboard/></section>
  </main>;
}
