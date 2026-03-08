import { Separator } from "@/components/ui/separator";

/**
 * 푸터 컴포넌트
 * PRD 섹션 5.7 참고
 */
export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-20">
      <div className="container mx-auto px-4 py-8">
        {/* 로고 */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🇰🇷</span>
          <h3 className="font-bold">대한민국 노마드 도시</h3>
        </div>

        {/* 링크 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          <a href="#" className="hover:text-foreground transition-colors">
            서비스 소개
          </a>
          <Separator orientation="vertical" className="h-4" />
          <a href="#" className="hover:text-foreground transition-colors">
            문의하기
          </a>
          <Separator orientation="vertical" className="h-4" />
          <a href="#" className="hover:text-foreground transition-colors">
            이용약관
          </a>
          <Separator orientation="vertical" className="h-4" />
          <a href="#" className="hover:text-foreground transition-colors">
            개인정보처리방침
          </a>
        </div>

        {/* 저작권 */}
        <p className="text-xs text-muted-foreground">
          © 2024 Korea Nomad Cities. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
