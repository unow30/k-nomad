import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/UserMenu";
import { getUserFromRequest } from "@/lib/auth-helpers";

export default async function Header() {
  const requestUser = await getUserFromRequest();
  const isAdmin = requestUser?.role === 'admin';

  return (
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* 로고 */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🏠</span>
              <h1 className="text-xl font-bold hidden sm:block">
                대한민국 노마드 도시
              </h1>
              <h1 className="text-lg font-bold sm:hidden">노마드 도시</h1>
            </Link>

            {/* 로그인 상태 조건부 버튼 */}
            <div className="flex items-center gap-2">
              {requestUser && requestUser.email ? (
                <UserMenu userEmail={requestUser.email} isAdmin={isAdmin} />
              ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                        로그인
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm">회원가입</Button>
                    </Link>
                  </>
              )}
            </div>
          </div>
        </div>
      </header>
  );
}
