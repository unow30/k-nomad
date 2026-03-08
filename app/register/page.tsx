import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signup } from "@/app/actions/auth";
import { SubmitButton } from "@/components/auth/submit-button";

/**
 * 회원가입 페이지
 */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/50 to-background py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <span className="text-5xl">🏠</span>
          </div>
          <CardTitle className="text-2xl text-center">회원가입</CardTitle>
          <CardDescription className="text-center">
            노마드 라이프를 시작해보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={signup} className="space-y-4">
            {/* 이메일 입력 */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                이메일
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                autoComplete="email"
                required
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                비밀번호
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="6자 이상 입력해주세요"
                autoComplete="new-password"
                required
              />
              <p className="text-xs text-muted-foreground">
                영문, 숫자를 포함하여 6자 이상
              </p>
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                비밀번호 확인
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력해주세요"
                autoComplete="new-password"
                required
              />
            </div>

            {/* 약관 동의 */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 mt-0.5 rounded border-gray-300"
                  required
                />
                {/*<label htmlFor="terms" className="text-sm text-muted-foreground">*/}
                {/*  <Link href="/terms" className="text-primary hover:underline">*/}
                {/*    이용약관*/}
                {/*  </Link>*/}
                {/*  {" "}및{" "}*/}
                {/*  <Link href="/privacy" className="text-primary hover:underline">*/}
                {/*    개인정보처리방침*/}
                {/*  </Link>*/}
                {/*  에 동의합니다*/}
                {/*</label>*/}
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                    이용약관
                  {" "}및{" "}
                    개인정보처리방침
                  에 동의합니다
                </label>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="marketing"
                  className="h-4 w-4 mt-0.5 rounded border-gray-300"
                />
                <label htmlFor="marketing" className="text-sm text-muted-foreground">
                  마케팅 정보 수신에 동의합니다 (선택)
                </label>
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <SubmitButton pendingText="가입 처리 중...">
              회원가입
            </SubmitButton>

            {/* 로그인 링크 */}
            <div className="text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                로그인
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
