import Link from "next/link";
export default function NotFound(){
  return <main className="simple-page"><section className="page-title parchment-hero">
    <div className="section-kicker">404</div><h1>페이지를 찾을 수 없습니다.</h1>
    <Link className="primary-link" href="/">성경 66권으로 돌아가기</Link>
  </section></main>;
}
