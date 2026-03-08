import { CityForm } from '../CityForm';
import Link from 'next/link';

export default function NewCityPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/cities"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← 도시 목록으로
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">새 도시 추가</h1>
        <p className="mt-2 text-gray-600">
          새로운 노마드 도시를 추가합니다. 필수 항목(*)을 반드시 입력해주세요.
        </p>
      </div>

      <CityForm />
    </div>
  );
}
