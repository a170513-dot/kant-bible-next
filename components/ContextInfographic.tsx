export function ContextInfographic({era,geography,culture}:{era:string;geography:string;culture:string}){
  return (
    <div className="context-grid" aria-label="성경 문화 지리 인포그래픽">
      <article className="context-card"><span className="context-icon">⌛</span><small>시대</small><strong>{era}</strong></article>
      <article className="context-card"><span className="context-icon">⌖</span><small>지리</small><strong>{geography}</strong></article>
      <article className="context-card"><span className="context-icon">𓂀</span><small>문화</small><strong>{culture}</strong></article>
    </div>
  );
}
