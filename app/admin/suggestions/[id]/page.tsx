import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth-helpers';
import Image from 'next/image';
import { getPublicUrl } from '@/lib/supabase-storage';
import { ApproveRejectButtons } from './ApproveRejectButtons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Suggestion {
  id: string;
  name: string;
  name_en?: string;
  type: string;
  address: string;
  description?: string;
  wifi_speed?: number;
  has_power: boolean;
  price_range?: string;
  opening_hours?: string;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  image_path?: string;
  status: string;
  admin_note?: string;
  created_at: string;
  cities: {
    name: string;
  };
  users: {
    display_name: string | null;
    email: string;
  };
}

export default async function SuggestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const supabase = await createClient();

  const { data: suggestion } = await supabase
    .from('workspace_suggestions')
    .select(
      `
      *,
      cities(name),
      users!workspace_suggestions_user_id_fkey(display_name, email)
    `
    )
    .eq('id', id)
    .single();

  if (!suggestion) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <p className="text-red-600">제안을 찾을 수 없습니다.</p>
          <Link href="/admin/suggestions">
            <Button variant="outline" className="mt-4">
              돌아가기
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const typeName: Record<string, string> = {
    cafe: '카페',
    coworking: '코워킹 스페이스',
    library: '도서관',
    hotel_lobby: '호텔 로비',
    other: '기타',
  };

  const priceRangeName: Record<string, string> = {
    free: '무료',
    low: '저렴 (1만원 이하)',
    medium: '보통 (1-3만원)',
    high: '고가 (3만원 이상)',
  };

  const imageUrl = (suggestion as Suggestion).image_path
    ? getPublicUrl(supabase, (suggestion as Suggestion).image_path!)
    : null;

  const typedSuggestion = suggestion as Suggestion;

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/admin/suggestions">
          <Button variant="outline" className="mb-6">
            ← 돌아가기
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">제안 검토</h1>

        <div className="bg-white rounded-lg border overflow-hidden">
          {imageUrl && (
            <div className="relative w-full h-64">
              <Image
                src={imageUrl}
                alt={typedSuggestion.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* 기본 정보 */}
            <div>
              <h2 className="text-2xl font-bold mb-2">{typedSuggestion.name}</h2>
              {typedSuggestion.name_en && (
                <p className="text-gray-600 mb-2">{typedSuggestion.name_en}</p>
              )}
              <p className="text-sm text-gray-600 mb-4">{typedSuggestion.cities.name}</p>

              <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded mb-4">
                {typedSuggestion.status === 'pending'
                  ? '검토 중'
                  : typedSuggestion.status === 'approved'
                    ? '승인됨'
                    : '거절됨'}
              </div>
            </div>

            {/* 제안자 정보 */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">제안자 정보</h3>
              <p className="text-sm">
                이름: {typedSuggestion.users.display_name || '정보 없음'}
              </p>
              <p className="text-sm text-gray-600">{typedSuggestion.users.email}</p>
              <p className="text-xs text-gray-500 mt-2">
                제출일: {new Date(typedSuggestion.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>

            {/* 작업공간 정보 */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">작업공간 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">타입</p>
                  <p className="font-medium">{typeName[typedSuggestion.type] || typedSuggestion.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">가격대</p>
                  <p className="font-medium">
                    {typedSuggestion.price_range
                      ? priceRangeName[typedSuggestion.price_range] || typedSuggestion.price_range
                      : '정보 없음'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">주소</p>
                  <p className="font-medium">{typedSuggestion.address}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">WiFi 속도</p>
                  <p className="font-medium">
                    {typedSuggestion.wifi_speed ? `${typedSuggestion.wifi_speed} Mbps` : '정보 없음'}
                  </p>
                </div>
                {typedSuggestion.opening_hours && (
                  <div>
                    <p className="text-xs text-gray-600">영업시간</p>
                    <p className="font-medium">{typedSuggestion.opening_hours}</p>
                  </div>
                )}
                {typedSuggestion.phone && (
                  <div>
                    <p className="text-xs text-gray-600">전화</p>
                    <p className="font-medium">{typedSuggestion.phone}</p>
                  </div>
                )}
                {typedSuggestion.website && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600">웹사이트</p>
                    <a
                      href={typedSuggestion.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {typedSuggestion.website}
                    </a>
                  </div>
                )}
                {(typedSuggestion.latitude || typedSuggestion.longitude) && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600">좌표</p>
                    <p className="font-medium">
                      {typedSuggestion.latitude}, {typedSuggestion.longitude}
                    </p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs text-gray-600">콘센트</p>
                  <p className="font-medium">
                    {typedSuggestion.has_power ? '✅ 있음' : '❌ 없음'}
                  </p>
                </div>
              </div>
            </div>

            {/* 설명 */}
            {typedSuggestion.description && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">설명</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {typedSuggestion.description}
                </p>
              </div>
            )}

            {/* 거절 사유 */}
            {typedSuggestion.admin_note && (
              <div className="border-t pt-4 bg-red-50 p-4 rounded">
                <h3 className="font-semibold mb-2 text-red-800">거절 사유</h3>
                <p className="text-red-700">{typedSuggestion.admin_note}</p>
              </div>
            )}

            {/* 승인/거절 버튼 */}
            {typedSuggestion.status === 'pending' && (
              <div className="border-t pt-6">
                <ApproveRejectButtons suggestionId={typedSuggestion.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
