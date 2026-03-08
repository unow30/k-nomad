import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { login } from "@/app/actions/auth";
import { SubmitButton } from "@/components/auth/submit-button";

/**
 * 로그인 페이지
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/50 to-background py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <span className="text-5xl">🏠</span>
          </div>
          <CardTitle className="text-2xl text-center">로그인</CardTitle>
          <CardDescription className="text-center">
            대한민국 노마드 도시에 오신 것을 환영합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {decodeURIComponent(error)}
            </div>
          )}

          {/* 성공 메시지 */}
          {message && (
            <div className="mb-4 p-3 rounded-md bg-green-100 text-green-800 text-sm dark:bg-green-900/20 dark:text-green-400">
              {decodeURIComponent(message)}
            </div>
          )}

          <form action={login} className="space-y-4">
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
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {/* 비밀번호 찾기 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground">
                  로그인 상태 유지
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                비밀번호 찾기
              </Link>
            </div>

            {/* 로그인 버튼 */}
            <SubmitButton pendingText="로그인 중...">
              로그인
            </SubmitButton>

            {/* 회원가입 링크 */}
            <div className="text-center text-sm text-muted-foreground">
              계정이 없으신가요?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                회원가입
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
