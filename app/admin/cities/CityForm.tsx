'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCity, updateCity, CreateCityData } from '@/app/actions/cities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CityFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function CityForm({ initialData, isEdit = false }: CityFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const data: CreateCityData = {
      name: formData.get('name') as string,
      name_en: formData.get('name_en') as string || undefined,
      region: formData.get('region') as string,
      province: formData.get('province') as string,
      rank: formData.get('rank') ? parseInt(formData.get('rank') as string) : undefined,
      overall_score: formData.get('overall_score')
        ? parseFloat(formData.get('overall_score') as string)
        : undefined,
      monthly_budget: formData.get('monthly_budget')
        ? parseInt(formData.get('monthly_budget') as string)
        : undefined,
      rent_studio: formData.get('rent_studio')
        ? parseInt(formData.get('rent_studio') as string)
        : undefined,
      internet_speed: formData.get('internet_speed')
        ? parseInt(formData.get('internet_speed') as string)
        : undefined,
      cafe_count: formData.get('cafe_count')
        ? parseInt(formData.get('cafe_count') as string)
        : undefined,
      ktx_time: formData.get('ktx_time')
        ? parseFloat(formData.get('ktx_time') as string)
        : undefined,
      image_url: formData.get('image_url') as string || undefined,
      latitude: formData.get('latitude')
        ? parseFloat(formData.get('latitude') as string)
        : undefined,
      longitude: formData.get('longitude')
        ? parseFloat(formData.get('longitude') as string)
        : undefined,
      tags: formData.get('tags')
        ? (formData.get('tags') as string).split(',').map((t) => t.trim())
        : undefined,
      best_season: formData.get('best_season') as string || undefined,
      weather_station_id: formData.get('weather_station_id')
        ? parseInt(formData.get('weather_station_id') as string)
        : undefined,
      address: formData.get('address') as string || undefined,
    };

    const result = isEdit
      ? await updateCity(initialData.id, data)
      : await createCity(data);

    if (result.success) {
      router.push('/admin/cities');
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">도시명 (한글) *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialData?.name}
              required
              placeholder="예: 제주시"
            />
          </div>
          <div>
            <Label htmlFor="name_en">도시명 (영문)</Label>
            <Input
              id="name_en"
              name="name_en"
              defaultValue={initialData?.name_en}
              placeholder="예: Jeju City"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="region">지역 *</Label>
            <select
              id="region"
              name="region"
              defaultValue={initialData?.region}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택하세요</option>
              <option value="jeju">제주</option>
              <option value="gyeongsang">경상</option>
              <option value="gangwon">강원</option>
              <option value="jeolla">전라</option>
              <option value="chungcheong">충청</option>
              <option value="seoul">서울</option>
              <option value="gyeonggi">경기</option>
            </select>
          </div>
          <div>
            <Label htmlFor="province">행정구역 *</Label>
            <Input
              id="province"
              name="province"
              defaultValue={initialData?.province}
              required
              placeholder="예: 제주특별자치도"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="rank">순위</Label>
            <Input
              id="rank"
              name="rank"
              type="number"
              defaultValue={initialData?.rank}
              placeholder="1"
            />
          </div>
          <div>
            <Label htmlFor="overall_score">평점 (0-5)</Label>
            <Input
              id="overall_score"
              name="overall_score"
              type="number"
              step="0.1"
              min="0"
              max="5"
              defaultValue={initialData?.overall_score}
              placeholder="4.5"
            />
          </div>
          <div>
            <Label htmlFor="best_season">최적 계절</Label>
            <select
              id="best_season"
              name="best_season"
              defaultValue={initialData?.best_season}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택하세요</option>
              <option value="spring">봄</option>
              <option value="summer">여름</option>
              <option value="fall">가을</option>
              <option value="winter">겨울</option>
            </select>
          </div>
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

        <div>
          <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
          <Input
            id="tags"
            name="tags"
            defaultValue={initialData?.tags?.join(', ')}
            placeholder="자연환경, 카페천국, 서핑"
          />
        </div>
      </div>

      {/* 생활비 정보 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">생활비 정보</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="monthly_budget">월 생활비 (만원)</Label>
            <Input
              id="monthly_budget"
              name="monthly_budget"
              type="number"
              defaultValue={initialData?.monthly_budget}
              placeholder="150"
            />
          </div>
          <div>
            <Label htmlFor="rent_studio">월세 (만원)</Label>
            <Input
              id="rent_studio"
              name="rent_studio"
              type="number"
              defaultValue={initialData?.rent_studio}
              placeholder="45"
            />
          </div>
          <div>
            <Label htmlFor="cafe_count">카페 수</Label>
            <Input
              id="cafe_count"
              name="cafe_count"
              type="number"
              defaultValue={initialData?.cafe_count}
              placeholder="89"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="internet_speed">인터넷 속도 (Mbps)</Label>
            <Input
              id="internet_speed"
              name="internet_speed"
              type="number"
              defaultValue={initialData?.internet_speed}
              placeholder="500"
            />
          </div>
          <div>
            <Label htmlFor="ktx_time">KTX 소요시간 (시간)</Label>
            <Input
              id="ktx_time"
              name="ktx_time"
              type="number"
              step="0.5"
              defaultValue={initialData?.ktx_time}
              placeholder="2.5"
            />
          </div>
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
              placeholder="33.4996"
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
              placeholder="126.5312"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">주소</Label>
          <Input
            id="address"
            name="address"
            defaultValue={initialData?.address}
            placeholder="기상청 관측소 주소"
          />
        </div>

        <div>
          <Label htmlFor="weather_station_id">기상청 관측소 ID</Label>
          <Input
            id="weather_station_id"
            name="weather_station_id"
            type="number"
            defaultValue={initialData?.weather_station_id}
            placeholder="184"
          />
        </div>
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
