import { createClient } from '@/utils/supabase/server';
import { CityForm } from '../../CityForm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditCityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 도시 데이터 조회
  const { data: city, error } = await supabase
    .from('cities')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !city) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/cities"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← 도시 목록으로
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          도시 수정: {city.name}
        </h1>
        <p className="mt-2 text-gray-600">
          도시 정보를 수정합니다. 필수 항목(*)을 반드시 입력해주세요.
        </p>
      </div>

      <CityForm initialData={city} isEdit={true} />
    </div>
  );
}
