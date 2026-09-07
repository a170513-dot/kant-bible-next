import type { BibleBook } from "@/lib/books";

const cityBySlug: Record<string,string> = {
  romans:"로마","1-corinthians":"고린도","2-corinthians":"고린도·마게도냐",
  galatians:"갈라디아",ephesians:"에베소·소아시아",philippians:"빌립보·마게도냐",
  colossians:"골로새·소아시아","1-thessalonians":"데살로니가·마게도냐",
  "2-thessalonians":"데살로니가·마게도냐","1-timothy":"에베소·지중해 동부",
  "2-timothy":"로마·지중해 세계",titus:"그레데",philemon:"골로새",
  revelation:"밧모·소아시아 일곱 교회"
};

export function getBookContext(book:BibleBook) {
  if (cityBySlug[book.slug]) return {
    era:"로마 제국기", geography:cityBySlug[book.slug],
    culture:book.category==="묵시문학" ? "제국 권력, 예배, 상징과 묵시 전승" : "도시 공동체, 가정교회, 유대·헬라 문화의 접점"
  };
  switch(book.category){
    case "모세오경": return {era:"족장 전승·출애굽·광야",geography:"메소포타미아·가나안·애굽·시내",culture:"고대 근동의 가족, 언약, 제의와 공동체 법"};
    case "역사서": return book.testament==="OT"
      ? {era:"정착·왕정·포로·귀환",geography:"가나안·이스라엘·유다·바벨론·페르시아",culture:"왕권, 성전, 토지, 언약 공동체의 변화"}
      : {era:"초기 교회·로마 제국기",geography:"예루살렘에서 소아시아와 로마까지",culture:"회당, 도시 네트워크, 디아스포라와 선교"};
    case "시가·지혜서": return {era:"왕정기와 지혜 전승",geography:"이스라엘·유다와 고대 근동",culture:"예배, 시, 지혜 교육, 삶과 고난의 성찰"};
    case "대예언서":
    case "소예언서": return {era:"왕정 후기·포로·귀환",geography:"이스라엘·유다·앗수르·바벨론·페르시아",culture:"제국, 성전, 정의, 심판과 회복의 언어"};
    case "복음서": return {era:"제2성전기·로마 통치기",geography:"갈릴리·사마리아·유대·예루살렘",culture:"성전, 회당, 절기, 유대교 집단과 로마 권력"};
    case "공동서신": return {era:"초기 교회·로마 제국기",geography:"유대와 디아스포라 공동체",culture:"박해, 공동체 윤리, 교회 정체성과 소망"};
    default: return {era:"성경의 역사적 세계",geography:"고대 근동과 지중해 세계",culture:"언약, 예배, 공동체와 일상의 문화"};
  }
}
