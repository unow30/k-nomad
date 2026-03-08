import { City, Review } from "@/types/city";

interface CityJsonLdProps {
  city: City;
  reviews: Review[];
  baseUrl?: string;
}

/**
 * Schema.org JSON-LD 구조화된 데이터 컴포넌트
 * 검색 엔진 최적화를 위한 구조화된 데이터 제공
 */
export default function CityJsonLd({ city, reviews, baseUrl = "https://nomad.kr" }: CityJsonLdProps) {
  // 평균 평점 계산
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  // Place 스키마 (도시 정보)
  const placeSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: city.name,
    description: city.description || `${city.name}은(는) 디지털 노마드에게 인기 있는 도시입니다.`,
    image: city.image,
    address: {
      "@type": "PostalAddress",
      addressRegion: city.province,
      addressCountry: "KR",
    },
    geo: {
      "@type": "GeoCoordinates",
      // 실제 좌표는 추후 추가
    },
    url: `${baseUrl}/city/${city.id}`,
  };

  // WebPage 스키마
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${city.name} - 디지털 노마드를 위한 도시 가이드`,
    description: city.description || `${city.name}의 생활비, 인터넷 속도, 날씨, 작업공간 정보를 확인하세요.`,
    url: `${baseUrl}/city/${city.id}`,
    isPartOf: {
      "@type": "WebSite",
      name: "대한민국 노마드 도시",
      url: baseUrl,
    },
    about: {
      "@type": "Place",
      name: city.name,
    },
    mainEntity: {
      "@type": "Place",
      name: city.name,
    },
  };

  // AggregateRating 스키마 (리뷰가 있는 경우)
  const aggregateRatingSchema = reviews.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${city.name} 노마드 생활`,
    description: `${city.name}에서의 디지털 노마드 생활 리뷰`,
    image: city.image,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: averageRating?.toFixed(1),
      bestRating: "5",
      worstRating: "1",
      ratingCount: reviews.length,
      reviewCount: reviews.length,
    },
    review: reviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.authorName,
      },
      datePublished: review.createdAt,
      reviewBody: review.content,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: "5",
        worstRating: "1",
      },
    })),
  } : null;

  // BreadcrumbList 스키마
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "도시",
        item: `${baseUrl}/city`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: city.name,
        item: `${baseUrl}/city/${city.id}`,
      },
    ],
  };

  // FAQPage 스키마 (도시에 대한 FAQ)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${city.name}의 한 달 생활비는 얼마인가요?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${city.name}의 평균 월 생활비는 약 ${city.monthlyBudget}만원입니다. 주거비 ${city.rentStudio}만원(원룸 기준)을 포함한 금액입니다.`,
        },
      },
      {
        "@type": "Question",
        name: `${city.name}의 인터넷 속도는 어떤가요?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${city.name}의 평균 인터넷 속도는 ${city.internetSpeed}Mbps입니다. 디지털 노마드 작업에 적합한 속도입니다.`,
        },
      },
      {
        "@type": "Question",
        name: `${city.name}에서 작업하기 좋은 카페가 많나요?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${city.name}에는 약 ${city.cafeCount}개의 카페와 작업공간이 있습니다.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {aggregateRatingSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingSchema) }}
        />
      )}
    </>
  );
}
