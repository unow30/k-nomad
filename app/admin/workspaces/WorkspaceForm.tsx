'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createWorkspace, updateWorkspace, CreateWorkspaceData } from '@/app/actions/workspaces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface WorkspaceFormProps {
  initialData?: any;
  isEdit?: boolean;
  cities: Array<{ id: string; name: string }>;
}

export function WorkspaceForm({ initialData, isEdit = false, cities }: WorkspaceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const data: CreateWorkspaceData = {
      city_id: formData.get('city_id') as string,
      name: formData.get('name') as string,
      name_en: (formData.get('name_en') as string) || undefined,
      type: formData.get('type') as any,
      address: formData.get('address') as string,
      description: (formData.get('description') as string) || undefined,
      wifi_speed: formData.get('wifi_speed')
        ? parseInt(formData.get('wifi_speed') as string)
        : undefined,
      has_power: formData.get('has_power') === 'true',
      price_range: (formData.get('price_range') as any) || undefined,
      opening_hours: (formData.get('opening_hours') as string) || undefined,
      phone: (formData.get('phone') as string) || undefined,
      website: (formData.get('website') as string) || undefined,
      latitude: formData.get('latitude')
        ? parseFloat(formData.get('latitude') as string)
        : undefined,
      longitude: formData.get('longitude')
        ? parseFloat(formData.get('longitude') as string)
        : undefined,
      image_url: (formData.get('image_url') as string) || undefined,
    };

    const result = isEdit
      ? await updateWorkspace(initialData.id, data)
      : await createWorkspace(data);

    if (result.success) {
      router.push('/admin/workspaces');
      router.refresh();
    } else {
      setError(result.error || '저장 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 기본 정보 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>

        <div>
          <Label htmlFor="city_id">도시 *</Label>
          <select
            id="city_id"
            name="city_id"
            defaultValue={initialData?.city_id}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">도시를 선택하세요</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">작업공간명 (한글) *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialData?.name}
              required
              placeholder="예: 카페 모모스"
            />
          </div>
          <div>
            <Label htmlFor="name_en">작업공간명 (영문)</Label>
            <Input
              id="name_en"
              name="name_en"
              defaultValue={initialData?.name_en}
              placeholder="예: Cafe Momos"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">타입 *</Label>
            <select
              id="type"
              name="type"
              defaultValue={initialData?.type || 'cafe'}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cafe">카페</option>
              <option value="coworking">코워킹</option>
              <option value="library">도서관</option>
              <option value="hotel_lobby">호텔 로비</option>
              <option value="other">기타</option>
            </select>
          </div>
          <div>
            <Label htmlFor="price_range">가격대</Label>
            <select
              id="price_range"
              name="price_range"
              defaultValue={initialData?.price_range || 'low'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="free">무료</option>
              <option value="low">저렴</option>
              <option value="medium">보통</option>
              <option value="high">비쌈</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="address">주소 *</Label>
          <Input
            id="address"
            name="address"
            defaultValue={initialData?.address}
            required
            placeholder="예: 제주시 구좌읍 해맞이해안로 1864"
          />
        </div>

        <div>
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={initialData?.description}
            placeholder="작업공간에 대한 상세 설명을 입력하세요"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="image_url">이미지 URL</Label>
          <Input
            id="image_url"
            name="image_url"
            type="url"
            defaultValue={initialData?.image_url}
            placeholder="https://images.unsplash.com/..."
          />
        </div>
      </div>

      {/* 시설 정보 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">시설 정보</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="wifi_speed">WiFi 속도 (Mbps)</Label>
            <Input
              id="wifi_speed"
              name="wifi_speed"
              type="number"
              defaultValue={initialData?.wifi_speed}
              placeholder="300"
            />
          </div>
          <div>
            <Label htmlFor="has_power">콘센트</Label>
            <select
              id="has_power"
              name="has_power"
              defaultValue={initialData?.has_power?.toString() || 'true'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">있음</option>
              <option value="false">없음</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="opening_hours">운영시간</Label>
            <Input
              id="opening_hours"
              name="opening_hours"
              defaultValue={initialData?.opening_hours}
              placeholder="예: 매일 08:00-21:00"
            />
          </div>
          <div>
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={initialData?.phone}
              placeholder="064-782-0000"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="website">웹사이트</Label>
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={initialData?.website}
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* 위치 정보 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">위치 정보</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">위도</Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="0.000001"
              defaultValue={initialData?.latitude}
              placeholder="33.5308"
            />
          </div>
          <div>
            <Label htmlFor="longitude">경도</Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="0.000001"
              defaultValue={initialData?.longitude}
              placeholder="126.8751"
            />
          </div>
        </div>

        <p className="text-sm text-gray-500">
          💡 팁: Google Maps에서 장소를 찾아 우클릭 → 좌표를 복사할 수 있습니다.
        </p>
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEdit
              ? '수정 중...'
              : '생성 중...'
            : isEdit
            ? '수정하기'
            : '생성하기'}
        </Button>
      </div>
    </form>
  );
}
