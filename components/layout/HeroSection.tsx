/**
 * 히어로 섹션 컴포넌트
 * PRD 섹션 5.4 참고
 */
export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-muted/50 to-background py-5 md:py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* 메인 타이틀 */}
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            🇰🇷 대한민국 노마드 도시 랭킹
          </h1>

          {/* 서브 타이틀 */}
          <p className="text-lg md:text-xl text-muted-foreground">
            일하기 좋은 도시를 찾아보세요
          </p>
        </div>
      </div>
    </section>
  );
}
