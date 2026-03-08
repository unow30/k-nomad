import { Metadata } from "next";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { getCityBySlug } from "@/lib/queries/cities";
import { getCityReviews } from "@/lib/queries/user-reviews";
import { getCityReaction } from "@/app/actions/city-reactions";
import { createClient } from "@/utils/supabase/server";
import CityDetailHero from "@/components/city/CityDetailHero";
import CityJsonLd from "@/components/city/CityJsonLd";
import PageBreadcrumb from "@/components/layout/Breadcrumb";

// 차트 컴포넌트 동적 로딩 (초기 번들 크기 최적화)
const CostBreakdownChart = dynamic(
  () => import("@/components/city/CostBreakdownChart"),
  { loading: () => <ChartSkeleton title="생활비 분석" /> }
);
const WeatherChart = dynamic(
  () => import("@/components/city/WeatherChart"),
  { loading: () => <ChartSkeleton title="날씨 정보" /> }
);
const AqiChart = dynamic(
  () => import("@/components/city/AqiChart"),
  { loading: () => <ChartSkeleton title="미세먼지 정보" /> }
);

// Phase 3 컴포넌트 동적 로딩
const WorkspaceSection = dynamic(
  () => import("@/components/workspace/WorkspaceSection"),
  { loading: () => <SectionSkeleton title="작업공간" /> }
);
const TransportSection = dynamic(
  () => import("@/components/city/TransportSection"),
  { loading: () => <SectionSkeleton title="교통 정보" /> }
);
const ReviewSection = dynamic(
  () => import("@/components/city/ReviewSection"),
  { loading: () => <SectionSkeleton title="리뷰" /> }
);

// 로딩 스켈레톤 컴포넌트
function ChartSkeleton({ title }: { title: string }) {
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="h-64 bg-muted/50 rounded-lg animate-pulse" />
    </section>
  );
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="container mx-auto px-4 py-12 border-t">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="h-48 bg-muted/50 rounded-lg animate-pulse" />
    </section>
  );
}

interface CityDetailPageProps {
  params: Promise<{ citySlug: string }>;
}

/**
 * 도시 상세페이지 (API 연동)
 * 동적 경로: /city/[citySlug]
 */
export default async function CityDetailPage({
  params,
}: CityDetailPageProps) {
  const { citySlug } = await params;
  const supabase = await createClient();

  let city;
  try {
    city = await getCityBySlug(supabase, citySlug);
  } catch (error) {
    notFound();
  }

  // 리뷰와 사용자 반응을 병렬로 조회 (waterfall 제거)
  const [reviews, userReaction] = await Promise.all([
    getCityReviews(supabase, city.id, 10),
    getCityReaction(city.id),
  ]);

  return (
    <>
      {/* Phase 4: JSON-LD 구조화된 데이터 */}
      <CityJsonLd city={city} reviews={reviews} />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto my-2 px-4 pt-4">
          <PageBreadcrumb
            items={[
              { label: "홈", href: "/" },
              { label: city.name },
            ]}
          />
        </div>

        {/* Phase 2-1: 히어로 섹션 */}
        <CityDetailHero
          city={city}
          initialUserLike={userReaction?.city_like || false}
          initialUserDislike={userReaction?.city_dislike || false}
        />

        {/* Phase 2-2: 생활비 분석 차트 */}
        <CostBreakdownChart city={city} />

        {/* Phase 2-3: 날씨 및 미세먼지 차트 */}
        <WeatherChart city={city} />
        <AqiChart city={city} />

        {/* Phase 3-1: 작업공간 섹션 */}
        <WorkspaceSection cityId={city.id} citySlug={citySlug} cityName={city.name} />

        {/* Phase 3-2: 교통 섹션 */}
        <TransportSection cityId={city.id} cityName={city.name} />

        {/* Phase 3-3: 리뷰 섹션 */}
        <ReviewSection reviews={reviews} cityName={city.name} cityId={city.id} />
      </main>
    </>
  );
}

/**
 * 메타데이터 (SEO)
 * API로 도시 정보 조회
 */
export async function generateMetadata({
  params,
}: CityDetailPageProps): Promise<Metadata> {
  const { citySlug } = await params;
  const supabase = await createClient();

  let city;
  try {
    city = await getCityBySlug(supabase, citySlug);
  } catch (error) {
    return {
      title: "도시를 찾을 수 없습니다",
      description: "요청하신 도시 정보를 찾을 수 없습니다.",
    };
  }

  const title = `${city.name} - 디지털 노마드를 위한 도시 가이드`;
  const description = city.description
    || `${city.name}에서 디지털 노마드로 살기: 월 생활비 ${city.monthlyBudget}만원, 인터넷 ${city.internetSpeed}Mbps, ${city.cafeCount}개의 카페. ${city.tags.slice(0, 3).join(", ")} 등의 특징을 가진 도시입니다.`;

  return {
    title,
    description,
    keywords: [
      city.name,
      "디지털 노마드",
      "원격근무",
      "노마드 도시",
      city.province,
      ...city.tags,
    ],
    authors: [{ name: "대한민국 노마드 도시" }],
    openGraph: {
      title,
      description,
      type: "article",
      locale: "ko_KR",
      siteName: "대한민국 노마드 도시",
      images: [
        {
          url: city.image,
          width: 1200,
          height: 630,
          alt: `${city.name} - 디지털 노마드 도시`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [city.image],
    },
    alternates: {
      canonical: `/city/${city.id}`,
    },
  };
}
