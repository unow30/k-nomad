'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WORKSPACE_TYPE_OPTIONS, PRICE_RANGE_OPTIONS } from '@/types/workspace';

interface City {
  id: string;
  name: string;
  name_en?: string;
}

export function SuggestionForm({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);

      const response = await fetch('/api/suggestions', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || '제안 제출에 실패했습니다');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/my-suggestions');
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '제안 제출에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-800 font-semibold">✅ 제안이 성공적으로 제출되었습니다!</p>
        <p className="text-green-700 text-sm mt-2">
          관리자 검토 후 승인되면 작업공간에 추가됩니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* 도시 선택 */}
      <div className="space-y-2">
        <Label htmlFor="city_id">도시 *</Label>
        <Select name="city_id" required>
          <SelectTrigger>
            <SelectValue placeholder="도시를 선택해주세요" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 이름 */}
      <div className="space-y-2">
        <Label htmlFor="name">작업공간명 *</Label>
        <Input
          id="name"
          name="name"
          placeholder="예: 카페 이름"
          required
        />
      </div>

      {/* 영문 이름 */}
      <div className="space-y-2">
        <Label htmlFor="name_en">영문 이름</Label>
        <Input
          id="name_en"
          name="name_en"
          placeholder="예: Cafe Name"
        />
      </div>

      {/* 타입 */}
      <div className="space-y-2">
        <Label htmlFor="type">타입 *</Label>
        <Select name="type" required>
          <SelectTrigger>
            <SelectValue placeholder="타입을 선택해주세요" />
          </SelectTrigger>
          <SelectContent>
            {WORKSPACE_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 주소 */}
      <div className="space-y-2">
        <Label htmlFor="address">주소 *</Label>
        <Input
          id="address"
          name="address"
          placeholder="예: 서울시 강남구..."
          required
        />
      </div>

      {/* 위도/경도 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">위도</Label>
          <Input
            id="latitude"
            name="latitude"
            type="number"
            step="0.0001"
            placeholder="37.4979"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">경도</Label>
          <Input
            id="longitude"
            name="longitude"
            type="number"
            step="0.0001"
            placeholder="127.0276"
          />
        </div>
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="작업공간에 대한 설명을 입력해주세요"
          rows={4}
        />
      </div>

      {/* WiFi 속도 */}
      <div className="space-y-2">
        <Label htmlFor="wifi_speed">WiFi 속도 (Mbps)</Label>
        <Input
          id="wifi_speed"
          name="wifi_speed"
          type="number"
          placeholder="예: 100"
        />
      </div>

      {/* 콘센트 */}
      <div className="space-y-2">
        <Label className="flex items-center">
          <input
            type="hidden"
            name="has_power"
            value="false"
          />
          <input
            type="checkbox"
            name="has_power"
            value="true"
            defaultChecked={true}
            className="rounded border-gray-300"
          />
          <span className="ml-2">콘센트 이용 가능</span>
        </Label>
      </div>

      {/* 가격대 */}
      <div className="space-y-2">
        <Label htmlFor="price_range">가격대</Label>
        <Select name="price_range">
          <SelectTrigger>
            <SelectValue placeholder="선택 사항" />
          </SelectTrigger>
          <SelectContent>
            {PRICE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 영업시간 */}
      <div className="space-y-2">
        <Label htmlFor="opening_hours">영업시간</Label>
        <Input
          id="opening_hours"
          name="opening_hours"
          placeholder="예: 09:00 - 22:00"
        />
      </div>

      {/* 전화번호 */}
      <div className="space-y-2">
        <Label htmlFor="phone">전화번호</Label>
        <Input
          id="phone"
          name="phone"
          placeholder="예: 02-1234-5678"
        />
      </div>

      {/* 웹사이트 */}
      <div className="space-y-2">
        <Label htmlFor="website">웹사이트</Label>
        <Input
          id="website"
          name="website"
          type="url"
          placeholder="예: https://example.com"
        />
      </div>

      {/* 이미지 업로드 */}
      <div className="space-y-2">
        <Label htmlFor="image">이미지 (선택)</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
          <label
            htmlFor="image"
            className="cursor-pointer block"
          >
            <p className="text-gray-600">
              이미지 파일을 선택하거나 드래그하세요 (JPG, PNG, WEBP, 최대 5MB)
            </p>
          </label>
        </div>

        {imagePreview && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">미리보기:</p>
            <img
              src={imagePreview}
              alt="이미지 미리보기"
              className="w-full max-w-sm h-48 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* 제출 버튼 */}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? '제출 중...' : '작업공간 제안하기'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          취소
        </Button>
      </div>
    </form>
  );
}
