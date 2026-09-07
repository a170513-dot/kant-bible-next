import Link from "next/link";

const navItems=[
  {href:"/#library",label:"성경 66권"},
  {href:"/#library",label:"공개 강의안"},
  {href:"/#library",label:"본문 연구"},
  {href:"/board",label:"나눔 게시판"},
  {href:"/admin",label:"관리자"},
];

export function SiteHeader(){
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link prefetch={true} className="brand" href="/" aria-label="Kant Bible 홈">
          <img className="brand-mascot" src="/visuals/kant-hamster-icon.webp" alt="" width="42" height="42"/>
          <span className="brand-name">Kant Bible</span>
        </Link>

        <nav className="main-nav" aria-label="주요 메뉴">
          {navItems.map(item=>(
            <Link prefetch={true} key={`${item.href}-${item.label}`} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <details className="mobile-menu">
          <summary aria-label="메뉴 열기"><span aria-hidden="true">☰</span></summary>
          <nav className="mobile-menu-panel" aria-label="모바일 메뉴">
            {navItems.map(item=>(
              <Link prefetch={true} key={`${item.href}-${item.label}`} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
