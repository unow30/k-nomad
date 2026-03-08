import { getCurrentUser } from '@/lib/auth-helpers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // 이중 체크 (미들웨어에서도 체크하지만 안전성을 위해)
  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 관리자 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                ⭐ 관리자 대시보드
              </Link>
              <nav className="flex space-x-4">
                <Link
                  href="/admin/cities"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  도시 관리
                </Link>
                <Link
                  href="/admin/workspaces"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  작업공간 관리
                </Link>
                <Link
                  href="/admin/reviews"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  도시 리뷰 관리
                </Link>
                <Link
                  href="/admin/workspace-reviews"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  작업공간 리뷰 관리
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.display_name || user.email}</span>
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                사용자 페이지로
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
