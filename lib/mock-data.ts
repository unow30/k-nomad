import { City, Workspace, Transportation, Review } from "@/types/city";
import { getAQILabel } from "./utils";

/**
 * 15개 도시 Mock 데이터
 * PRD 부록 12.1 참고
 *
 * @deprecated monthlyWeather 필드는 더 이상 사용되지 않습니다.
 * 월별 날씨 데이터는 Supabase monthly_weather 테이블에서 조회합니다.
 * getCityBySlug() 함수가 자동으로 DB에서 데이터를 가져옵니다.
 */
export const cities: City[] = [
  {
    id: "jeju",
    rank: 1,
    name: "제주시",
    region: "jeju",
    province: "제주특별자치도",
    image:
      "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=400&h=300&fit=crop",
    overallScore: 4.5,
    reviewCount: 127,
    monthlyBudget: 150,
    rentStudio: 45,
    internetSpeed: 500,
    currentWeather: { temp: 12, aqi: 42, aqiLabel: getAQILabel(42), rainfall: 120 },
    cafeCount: 89,
    ktxTime: 0, // 제주는 KTX 없음
    likes: 127,
    dislikes: 23,
    tags: ["자연환경", "카페천국", "서핑", "조용함", "바다뷰"],
    budget: "100to200",
    environment: ["nature", "cafe"],
    bestSeason: "spring",
    description: "따뜻한 기후와 자연 환경이 특징인 제주도. 완만한 물가와 우수한 인터넷 속도로 디지털 노마드의 선호도가 높습니다.",
    costBreakdown: {
      housing: 45,
      food: 50,
      transport: 15,
      leisure: 40,
    },
    monthlyWeather: [
      { month: 1, avgTemp: 3, maxTemp: 8, minTemp: -2, rainfall: 45 },
      { month: 2, avgTemp: 4, maxTemp: 10, minTemp: -1, rainfall: 50 },
      { month: 3, avgTemp: 9, maxTemp: 15, minTemp: 3, rainfall: 60 },
      { month: 4, avgTemp: 15, maxTemp: 22, minTemp: 8, rainfall: 75 },
      { month: 5, avgTemp: 20, maxTemp: 27, minTemp: 13, rainfall: 100 },
      { month: 6, avgTemp: 23, maxTemp: 29, minTemp: 18, rainfall: 160 },
      { month: 7, avgTemp: 27, maxTemp: 32, minTemp: 22, rainfall: 220 },
      { month: 8, avgTemp: 28, maxTemp: 33, minTemp: 23, rainfall: 190 },
      { month: 9, avgTemp: 24, maxTemp: 29, minTemp: 19, rainfall: 110 },
      { month: 10, avgTemp: 18, maxTemp: 24, minTemp: 12, rainfall: 80 },
      { month: 11, avgTemp: 12, maxTemp: 18, minTemp: 6, rainfall: 50 },
      { month: 12, avgTemp: 5, maxTemp: 11, minTemp: 0, rainfall: 40 },
    ],
    monthlyAqi: [
      { month: 1, aqi: 45, label: "보통" },
      { month: 2, aqi: 52, label: "보통" },
      { month: 3, aqi: 42, label: "좋음" },
      { month: 4, aqi: 38, label: "좋음" },
      { month: 5, aqi: 35, label: "좋음" },
      { month: 6, aqi: 32, label: "좋음" },
      { month: 7, aqi: 28, label: "좋음" },
      { month: 8, aqi: 30, label: "좋음" },
      { month: 9, aqi: 36, label: "좋음" },
      { month: 10, aqi: 42, label: "좋음" },
      { month: 11, aqi: 48, label: "보통" },
      { month: 12, aqi: 50, label: "보통" },
    ],
  },
  {
    id: "seogwipo",
    rank: 2,
    name: "서귀포시",
    region: "jeju",
    province: "제주특별자치도",
    image:
      "https://images.unsplash.com/photo-1579169326371-b4f5765d84bb?w=400&h=300&fit=crop",
    overallScore: 4.4,
    reviewCount: 98,
    monthlyBudget: 140,
    rentStudio: 42,
    internetSpeed: 450,
    currentWeather: { temp: 13, aqi: 38, aqiLabel: getAQILabel(38), rainfall: 110 },
    cafeCount: 67,
    ktxTime: 0,
    likes: 98,
    dislikes: 18,
    tags: ["자연", "조용함", "힐링", "귤", "바다"],
    budget: "100to200",
    environment: ["nature"],
    bestSeason: "fall",
  },
  {
    id: "busan",
    rank: 3,
    name: "부산",
    region: "gyeongsang",
    province: "부산광역시",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
    overallScore: 4.3,
    reviewCount: 156,
    monthlyBudget: 120,
    rentStudio: 38,
    internetSpeed: 600,
    currentWeather: { temp: 8, aqi: 58, aqiLabel: getAQILabel(58), rainfall: 65 },
    cafeCount: 234,
    ktxTime: 2.5,
    likes: 156,
    dislikes: 31,
    tags: ["해변", "대도시", "교통편리", "맛집", "야경"],
    budget: "100to200",
    environment: ["urban", "cafe"],
    bestSeason: "summer",
    description: "해양 도시 부산은 높은 인터넷 속도와 풍부한 카페 문화를 자랑합니다. 서울로의 KTX 접근성도 좋아 출장이 많은 노마드에게 인기입니다.",
    costBreakdown: {
      housing: 38,
      food: 45,
      transport: 18,
      leisure: 19,
    },
    monthlyWeather: [
      { month: 1, avgTemp: 2, maxTemp: 8, minTemp: -4, rainfall: 30 },
      { month: 2, avgTemp: 3, maxTemp: 10, minTemp: -3, rainfall: 35 },
      { month: 3, avgTemp: 8, maxTemp: 15, minTemp: 1, rainfall: 50 },
      { month: 4, avgTemp: 14, maxTemp: 21, minTemp: 7, rainfall: 65 },
      { month: 5, avgTemp: 19, maxTemp: 26, minTemp: 12, rainfall: 90 },
      { month: 6, avgTemp: 23, maxTemp: 29, minTemp: 17, rainfall: 140 },
      { month: 7, avgTemp: 27, maxTemp: 32, minTemp: 21, rainfall: 180 },
      { month: 8, avgTemp: 28, maxTemp: 33, minTemp: 22, rainfall: 160 },
      { month: 9, avgTemp: 23, maxTemp: 28, minTemp: 18, rainfall: 100 },
      { month: 10, avgTemp: 17, maxTemp: 23, minTemp: 11, rainfall: 50 },
      { month: 11, avgTemp: 11, maxTemp: 17, minTemp: 5, rainfall: 40 },
      { month: 12, avgTemp: 4, maxTemp: 10, minTemp: -1, rainfall: 30 },
    ],
    monthlyAqi: [
      { month: 1, aqi: 65, label: "보통" },
      { month: 2, aqi: 70, label: "나쁨" },
      { month: 3, aqi: 58, label: "보통" },
      { month: 4, aqi: 48, label: "보통" },
      { month: 5, aqi: 42, label: "좋음" },
      { month: 6, aqi: 40, label: "좋음" },
      { month: 7, aqi: 38, label: "좋음" },
      { month: 8, aqi: 42, label: "좋음" },
      { month: 9, aqi: 45, label: "보통" },
      { month: 10, aqi: 52, label: "보통" },
      { month: 11, aqi: 60, label: "보통" },
      { month: 12, aqi: 68, label: "나쁨" },
    ],
  },
  {
    id: "gangneung",
    rank: 4,
    name: "강릉",
    region: "gangwon",
    province: "강원특별자치도",
    image:
      "https://images.unsplash.com/photo-1583426573939-97d09302d76a?w=400&h=300&fit=crop",
    overallScore: 4.2,
    reviewCount: 112,
    monthlyBudget: 100,
    rentStudio: 35,
    internetSpeed: 400,
    currentWeather: { temp: 2, aqi: 35, aqiLabel: getAQILabel(35), rainfall: 35 },
    cafeCount: 145,
    ktxTime: 2,
    likes: 112,
    dislikes: 18,
    tags: ["커피", "바다", "조용함", "KTX", "올림픽"],
    budget: "under100",
    environment: ["cafe", "nature"],
    bestSeason: "summer",
    description: "강릉은 합리적인 물가와 훌륭한 카페 문화로 유명합니다. 서울로의 KTX 접근성이 뛰어나고 해변의 자연환경도 매력적입니다.",
    costBreakdown: {
      housing: 35,
      food: 35,
      transport: 12,
      leisure: 18,
    },
    monthlyWeather: [
      { month: 1, avgTemp: -3, maxTemp: 3, minTemp: -8, rainfall: 20 },
      { month: 2, avgTemp: -2, maxTemp: 5, minTemp: -7, rainfall: 25 },
      { month: 3, avgTemp: 4, maxTemp: 11, minTemp: -2, rainfall: 40 },
      { month: 4, avgTemp: 11, maxTemp: 19, minTemp: 4, rainfall: 55 },
      { month: 5, avgTemp: 17, maxTemp: 25, minTemp: 10, rainfall: 85 },
      { month: 6, avgTemp: 21, maxTemp: 28, minTemp: 15, rainfall: 130 },
      { month: 7, avgTemp: 25, maxTemp: 31, minTemp: 20, rainfall: 170 },
      { month: 8, avgTemp: 26, maxTemp: 32, minTemp: 21, rainfall: 140 },
      { month: 9, avgTemp: 21, maxTemp: 26, minTemp: 16, rainfall: 80 },
      { month: 10, avgTemp: 15, maxTemp: 21, minTemp: 9, rainfall: 45 },
      { month: 11, avgTemp: 8, maxTemp: 14, minTemp: 2, rainfall: 30 },
      { month: 12, avgTemp: 0, maxTemp: 6, minTemp: -5, rainfall: 20 },
    ],
    monthlyAqi: [
      { month: 1, aqi: 48, label: "보통" },
      { month: 2, aqi: 52, label: "보통" },
      { month: 3, aqi: 42, label: "좋음" },
      { month: 4, aqi: 35, label: "좋음" },
      { month: 5, aqi: 32, label: "좋음" },
      { month: 6, aqi: 30, label: "좋음" },
      { month: 7, aqi: 28, label: "좋음" },
      { month: 8, aqi: 32, label: "좋음" },
      { month: 9, aqi: 35, label: "좋음" },
      { month: 10, aqi: 38, label: "좋음" },
      { month: 11, aqi: 42, label: "좋음" },
      { month: 12, aqi: 45, label: "보통" },
    ],
  },
  {
    id: "sokcho",
    rank: 5,
    name: "속초",
    region: "gangwon",
    province: "강원특별자치도",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
    overallScore: 4.1,
    reviewCount: 89,
    monthlyBudget: 95,
    rentStudio: 32,
    internetSpeed: 350,
    currentWeather: { temp: 1, aqi: 32, aqiLabel: getAQILabel(32), rainfall: 25 },
    cafeCount: 78,
    ktxTime: 0, // KTX 없음 (버스 이용)
    likes: 89,
    dislikes: 12,
    tags: ["자연", "관광", "해변", "설악산", "청초호"],
    budget: "under100",
    environment: ["nature"],
    bestSeason: "summer",
  },
  {
    id: "yeosu",
    rank: 6,
    name: "여수",
    region: "jeolla",
    province: "전라남도",
    image:
      "https://images.unsplash.com/photo-1590841609987-4ac211afdde1?w=400&h=300&fit=crop",
    overallScore: 4.1,
    reviewCount: 94,
    monthlyBudget: 100,
    rentStudio: 33,
    internetSpeed: 380,
    currentWeather: { temp: 10, aqi: 45, aqiLabel: getAQILabel(45), rainfall: 80 },
    cafeCount: 102,
    ktxTime: 3,
    likes: 94,
    dislikes: 15,
    tags: ["야경", "해양", "낭만포차", "케이블카", "섬"],
    budget: "under100",
    environment: ["nature", "urban"],
    bestSeason: "summer",
  },
  {
    id: "jeonju",
    rank: 7,
    name: "전주",
    region: "jeolla",
    province: "전북특별자치도",
    image:
      "https://images.unsplash.com/photo-1583562835057-a62d1beffbf3?w=400&h=300&fit=crop",
    overallScore: 3.9,
    reviewCount: 87,
    monthlyBudget: 95,
    rentStudio: 30,
    internetSpeed: 450,
    currentWeather: { temp: 4, aqi: 52, aqiLabel: getAQILabel(52), rainfall: 45 },
    cafeCount: 156,
    ktxTime: 2,
    likes: 87,
    dislikes: 15,
    tags: ["한옥마을", "문화", "맛집", "전통", "비빔밥"],
    budget: "under100",
    environment: ["cafe", "urban"],
    bestSeason: "fall",
  },
  {
    id: "daejeon",
    rank: 8,
    name: "대전",
    region: "chungcheong",
    province: "대전광역시",
    image:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&h=300&fit=crop",
    overallScore: 4.0,
    reviewCount: 103,
    monthlyBudget: 110,
    rentStudio: 35,
    internetSpeed: 550,
    currentWeather: { temp: 5, aqi: 61, aqiLabel: getAQILabel(61), rainfall: 50 },
    cafeCount: 189,
    ktxTime: 1,
    likes: 103,
    dislikes: 28,
    tags: ["교통허브", "IT", "대학가", "과학도시", "중심"],
    budget: "100to200",
    environment: ["urban", "coworking"],
    bestSeason: "spring",
  },
  {
    id: "daegu",
    rank: 9,
    name: "대구",
    region: "gyeongsang",
    province: "대구광역시",
    image:
      "https://images.unsplash.com/photo-1546874177-9e664107314e?w=400&h=300&fit=crop",
    overallScore: 3.8,
    reviewCount: 95,
    monthlyBudget: 105,
    rentStudio: 32,
    internetSpeed: 520,
    currentWeather: { temp: 6, aqi: 68, aqiLabel: getAQILabel(68), rainfall: 55 },
    cafeCount: 198,
    ktxTime: 1.5,
    likes: 95,
    dislikes: 22,
    tags: ["저렴", "대도시", "패션", "치맥", "김광석"],
    budget: "100to200",
    environment: ["urban", "cafe"],
    bestSeason: "fall",
  },
  {
    id: "gyeongju",
    rank: 10,
    name: "경주",
    region: "gyeongsang",
    province: "경상북도",
    image:
      "https://images.unsplash.com/photo-1590841609987-4ac211afdde1?w=400&h=300&fit=crop",
    overallScore: 3.9,
    reviewCount: 78,
    monthlyBudget: 90,
    rentStudio: 28,
    internetSpeed: 380,
    currentWeather: { temp: 5, aqi: 48, aqiLabel: getAQILabel(48), rainfall: 40 },
    cafeCount: 92,
    ktxTime: 2,
    likes: 78,
    dislikes: 14,
    tags: ["역사", "문화재", "조용함", "힐링", "천년"],
    budget: "under100",
    environment: ["nature", "cafe"],
    bestSeason: "spring",
  },
  {
    id: "chuncheon",
    rank: 11,
    name: "춘천",
    region: "gangwon",
    province: "강원특별자치도",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop",
    overallScore: 3.8,
    reviewCount: 72,
    monthlyBudget: 95,
    rentStudio: 33,
    internetSpeed: 420,
    currentWeather: { temp: 0, aqi: 42, aqiLabel: getAQILabel(42), rainfall: 30 },
    cafeCount: 87,
    ktxTime: 1.5,
    likes: 72,
    dislikes: 16,
    tags: ["자연", "닭갈비", "호수", "접근성", "소양강"],
    budget: "under100",
    environment: ["nature", "cafe"],
    bestSeason: "summer",
  },
  {
    id: "mokpo",
    rank: 12,
    name: "목포",
    region: "jeolla",
    province: "전라남도",
    image:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=300&fit=crop",
    overallScore: 3.7,
    reviewCount: 65,
    monthlyBudget: 88,
    rentStudio: 27,
    internetSpeed: 360,
    currentWeather: { temp: 8, aqi: 44, aqiLabel: getAQILabel(44), rainfall: 75 },
    cafeCount: 76,
    ktxTime: 2.5,
    likes: 65,
    dislikes: 12,
    tags: ["항구", "해양", "저렴", "KTX", "유달산"],
    budget: "under100",
    environment: ["nature"],
    bestSeason: "fall",
  },
  {
    id: "sejong",
    rank: 13,
    name: "세종",
    region: "chungcheong",
    province: "세종특별자치시",
    image:
      "https://images.unsplash.com/photo-1548691905-57c36cc8d935?w=400&h=300&fit=crop",
    overallScore: 3.9,
    reviewCount: 58,
    monthlyBudget: 115,
    rentStudio: 40,
    internetSpeed: 580,
    currentWeather: { temp: 4, aqi: 55, aqiLabel: getAQILabel(55), rainfall: 48 },
    cafeCount: 95,
    ktxTime: 1,
    likes: 58,
    dislikes: 11,
    tags: ["신도시", "깨끗함", "인프라", "행정", "계획도시"],
    budget: "100to200",
    environment: ["coworking", "urban"],
    bestSeason: "spring",
  },
  {
    id: "pohang",
    rank: 14,
    name: "포항",
    region: "gyeongsang",
    province: "경상북도",
    image:
      "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=400&h=300&fit=crop",
    overallScore: 3.6,
    reviewCount: 54,
    monthlyBudget: 92,
    rentStudio: 29,
    internetSpeed: 400,
    currentWeather: { temp: 6, aqi: 51, aqiLabel: getAQILabel(51), rainfall: 60 },
    cafeCount: 82,
    ktxTime: 2.5,
    likes: 54,
    dislikes: 13,
    tags: ["해양", "공학", "호미곶", "제철", "대학"],
    budget: "under100",
    environment: ["urban", "nature"],
    bestSeason: "summer",
  },
  {
    id: "tongyeong",
    rank: 15,
    name: "통영",
    region: "gyeongsang",
    province: "경상남도",
    image:
      "https://images.unsplash.com/photo-1571804066398-9e68e2ede3ea?w=400&h=300&fit=crop",
    overallScore: 3.8,
    reviewCount: 69,
    monthlyBudget: 93,
    rentStudio: 30,
    internetSpeed: 350,
    currentWeather: { temp: 9, aqi: 40, aqiLabel: getAQILabel(40), rainfall: 85 },
    cafeCount: 71,
    ktxTime: 0, // KTX 없음 (버스 이용)
    likes: 69,
    dislikes: 14,
    tags: ["섬", "예술", "해산물", "케이블카", "낭만"],
    budget: "under100",
    environment: ["nature", "cafe"],
    bestSeason: "fall",
  },
];

/**
 * 도시 ID로 도시 정보 조회
 */
export function getCityById(id: string): City | undefined {
  return cities.find((city) => city.id === id);
}

/**
 * 전체 도시 목록 반환
 */
export function getAllCities(): City[] {
  return cities;
}

/**
 * 순위순으로 정렬된 도시 목록 반환
 */
export function getCitiesByRank(): City[] {
  return [...cities].sort((a, b) => a.rank - b.rank);
}

/**
 * 도시별 작업공간 Mock 데이터
 */
export const workspaces: Record<string, Workspace[]> = {
  jeju: [
    { id: "ws-jeju-1", name: "카페 몽상", type: "cafe", address: "제주시 연동 312-24", distance: 0.3, rating: 4.5, hasPower: true, wifiSpeed: 100, hours: "08:00-22:00" },
    { id: "ws-jeju-2", name: "제주 코워킹 허브", type: "coworking", address: "제주시 노형동 925-1", distance: 1.2, rating: 4.8, hasPower: true, wifiSpeed: 500, hours: "09:00-21:00" },
    { id: "ws-jeju-3", name: "오름 카페", type: "cafe", address: "제주시 조천읍 함덕리 1008", distance: 5.5, rating: 4.3, hasPower: true, wifiSpeed: 80, hours: "09:00-20:00" },
    { id: "ws-jeju-4", name: "노마드 제주", type: "coworking", address: "제주시 일도2동 1045-3", distance: 0.8, rating: 4.6, hasPower: true, wifiSpeed: 300, hours: "24시간" },
    { id: "ws-jeju-5", name: "바다뷰 카페", type: "cafe", address: "제주시 애월읍 곽지리 2045", distance: 8.2, rating: 4.7, hasPower: true, wifiSpeed: 50, hours: "10:00-19:00" },
  ],
  busan: [
    { id: "ws-busan-1", name: "해운대 코워킹", type: "coworking", address: "부산 해운대구 우동 1467", distance: 0.5, rating: 4.7, hasPower: true, wifiSpeed: 500, hours: "08:00-22:00" },
    { id: "ws-busan-2", name: "광안리 카페", type: "cafe", address: "부산 수영구 광안동 192-3", distance: 1.0, rating: 4.4, hasPower: true, wifiSpeed: 120, hours: "09:00-23:00" },
    { id: "ws-busan-3", name: "센텀 스터디카페", type: "coworking", address: "부산 해운대구 센텀동 35", distance: 2.3, rating: 4.6, hasPower: true, wifiSpeed: 400, hours: "24시간" },
    { id: "ws-busan-4", name: "서면 작업실", type: "coworking", address: "부산 부산진구 부전동 256-1", distance: 4.5, rating: 4.5, hasPower: true, wifiSpeed: 350, hours: "09:00-21:00" },
    { id: "ws-busan-5", name: "감천 카페", type: "cafe", address: "부산 사하구 감천동 10-13", distance: 7.0, rating: 4.2, hasPower: false, wifiSpeed: 60, hours: "10:00-18:00" },
  ],
  gangneung: [
    { id: "ws-gang-1", name: "강릉 커피거리 카페", type: "cafe", address: "강릉시 안목해변길 55", distance: 0.2, rating: 4.6, hasPower: true, wifiSpeed: 80, hours: "08:00-21:00" },
    { id: "ws-gang-2", name: "테라로사 본점", type: "cafe", address: "강릉시 구정면 현천리 7-9", distance: 5.0, rating: 4.9, hasPower: true, wifiSpeed: 100, hours: "09:00-22:00" },
    { id: "ws-gang-3", name: "강릉 디지털센터", type: "coworking", address: "강릉시 용강동 1452", distance: 1.5, rating: 4.3, hasPower: true, wifiSpeed: 300, hours: "09:00-18:00" },
    { id: "ws-gang-4", name: "보헤미안 박이추", type: "cafe", address: "강릉시 사천면 해안로 1107", distance: 8.0, rating: 4.8, hasPower: true, wifiSpeed: 50, hours: "10:00-19:00" },
  ],
  daejeon: [
    { id: "ws-dj-1", name: "대전 창업허브", type: "coworking", address: "대전 유성구 대학로 99", distance: 0.5, rating: 4.7, hasPower: true, wifiSpeed: 500, hours: "24시간" },
    { id: "ws-dj-2", name: "둔산 스터디카페", type: "coworking", address: "대전 서구 둔산동 1234", distance: 1.2, rating: 4.5, hasPower: true, wifiSpeed: 400, hours: "07:00-24:00" },
    { id: "ws-dj-3", name: "유성온천 카페", type: "cafe", address: "대전 유성구 봉명동 551", distance: 2.0, rating: 4.3, hasPower: true, wifiSpeed: 100, hours: "09:00-22:00" },
  ],
  jeonju: [
    { id: "ws-jj-1", name: "한옥마을 카페", type: "cafe", address: "전주시 완산구 교동 127", distance: 0.3, rating: 4.6, hasPower: true, wifiSpeed: 80, hours: "10:00-21:00" },
    { id: "ws-jj-2", name: "전주 IT센터", type: "coworking", address: "전주시 덕진구 금암동 1245", distance: 3.0, rating: 4.4, hasPower: true, wifiSpeed: 350, hours: "09:00-21:00" },
    { id: "ws-jj-3", name: "객리단길 카페", type: "cafe", address: "전주시 완산구 풍남동 3가", distance: 0.8, rating: 4.5, hasPower: true, wifiSpeed: 100, hours: "11:00-22:00" },
  ],
};

/**
 * 도시별 교통 정보 Mock 데이터
 */
export const transportations: Record<string, Transportation[]> = {
  jeju: [
    { destination: "서울(김포)", type: "airplane", duration: 65, price: 80000, note: "1시간 간격 운항" },
    { destination: "부산(김해)", type: "airplane", duration: 55, price: 60000, note: "하루 10편" },
    { destination: "대구", type: "airplane", duration: 50, price: 55000, note: "하루 5편" },
  ],
  seogwipo: [
    { destination: "서울(김포)", type: "airplane", duration: 65, price: 80000, note: "제주공항 이용 (30분 거리)" },
    { destination: "부산(김해)", type: "airplane", duration: 55, price: 60000, note: "제주공항 이용" },
  ],
  busan: [
    { destination: "서울", type: "ktx", duration: 150, price: 59800, note: "15분 간격" },
    { destination: "대전", type: "ktx", duration: 90, price: 35000 },
    { destination: "대구", type: "ktx", duration: 45, price: 18000 },
    { destination: "광주", type: "bus", duration: 240, price: 25000 },
  ],
  gangneung: [
    { destination: "서울", type: "ktx", duration: 120, price: 28600, note: "30분 간격" },
    { destination: "서울(동서울)", type: "bus", duration: 150, price: 18000, note: "20분 간격" },
  ],
  sokcho: [
    { destination: "서울(동서울)", type: "bus", duration: 150, price: 19000, note: "30분 간격" },
    { destination: "강릉", type: "bus", duration: 60, price: 7000 },
  ],
  yeosu: [
    { destination: "서울", type: "ktx", duration: 180, price: 52600, note: "1시간 간격" },
    { destination: "부산", type: "bus", duration: 180, price: 20000 },
    { destination: "광주", type: "bus", duration: 120, price: 12000 },
  ],
  jeonju: [
    { destination: "서울", type: "ktx", duration: 90, price: 35000, note: "30분 간격" },
    { destination: "서울(센트럴시티)", type: "bus", duration: 150, price: 15000, note: "15분 간격" },
    { destination: "광주", type: "bus", duration: 90, price: 9000 },
  ],
  daejeon: [
    { destination: "서울", type: "ktx", duration: 55, price: 23700, note: "10분 간격" },
    { destination: "부산", type: "ktx", duration: 95, price: 35000 },
    { destination: "광주", type: "ktx", duration: 60, price: 25000 },
  ],
  daegu: [
    { destination: "서울", type: "ktx", duration: 100, price: 43500, note: "20분 간격" },
    { destination: "부산", type: "ktx", duration: 45, price: 18000 },
    { destination: "대전", type: "ktx", duration: 50, price: 20000 },
  ],
  gyeongju: [
    { destination: "서울", type: "ktx", duration: 130, price: 47000, note: "신경주역" },
    { destination: "부산", type: "bus", duration: 60, price: 6000, note: "15분 간격" },
    { destination: "대구", type: "bus", duration: 50, price: 5000 },
  ],
  chuncheon: [
    { destination: "서울(용산)", type: "ktx", duration: 70, price: 10000, note: "ITX-청춘" },
    { destination: "서울(상봉)", type: "bus", duration: 90, price: 8000, note: "10분 간격" },
  ],
  mokpo: [
    { destination: "서울", type: "ktx", duration: 150, price: 55000, note: "1시간 간격" },
    { destination: "광주", type: "bus", duration: 60, price: 7000, note: "20분 간격" },
  ],
  sejong: [
    { destination: "서울", type: "bus", duration: 120, price: 12000, note: "오송역 KTX 연계" },
    { destination: "대전", type: "bus", duration: 30, price: 3000, note: "BRT 10분 간격" },
  ],
  pohang: [
    { destination: "서울", type: "ktx", duration: 150, price: 47000, note: "포항역" },
    { destination: "부산", type: "bus", duration: 90, price: 10000 },
    { destination: "대구", type: "bus", duration: 80, price: 9000 },
  ],
  tongyeong: [
    { destination: "서울(센트럴)", type: "bus", duration: 270, price: 28000 },
    { destination: "부산", type: "bus", duration: 120, price: 15000, note: "30분 간격" },
    { destination: "마산", type: "bus", duration: 40, price: 5000 },
  ],
};

/**
 * 도시별 리뷰 Mock 데이터
 */
export const reviews: Record<string, Review[]> = {
  jeju: [
    {
      id: "rv-jeju-1",
      authorName: "디지털노마드김",
      rating: 5,
      content: "제주에서 3개월 살면서 정말 만족했습니다. 카페도 많고 인터넷도 빨라서 작업하기 좋아요. 한 달 생활비 150만원 정도면 충분해요.",
      createdAt: "2024-11-15",
      likes: 42,
      stayDuration: "3개월",
    },
    {
      id: "rv-jeju-2",
      authorName: "프리랜서박",
      rating: 4,
      content: "자연환경은 최고입니다. 다만 겨울에는 바람이 많이 불어서 실외 활동이 제한적이에요. 카페 작업 위주로 하시는 분들께 추천!",
      createdAt: "2024-10-28",
      likes: 28,
      stayDuration: "2개월",
    },
    {
      id: "rv-jeju-3",
      authorName: "개발자이",
      rating: 5,
      content: "코워킹 스페이스가 잘 갖춰져 있어요. 특히 제주 코워킹 허브는 시설이 정말 좋습니다. 네트워킹 이벤트도 자주 열려요.",
      createdAt: "2024-09-20",
      likes: 35,
      stayDuration: "1개월",
    },
    {
      id: "rv-jeju-4",
      authorName: "작가최",
      rating: 4,
      content: "글 쓰기에 집중하기 좋은 환경이에요. 조용한 카페도 많고, 영감을 주는 자연 풍경이 가득해요. 다만 렌터카가 거의 필수입니다.",
      createdAt: "2024-08-05",
      likes: 19,
      stayDuration: "2주",
    },
  ],
  busan: [
    {
      id: "rv-busan-1",
      authorName: "웹개발자정",
      rating: 5,
      content: "서울보다 물가가 저렴하면서 대도시의 편리함은 그대로! 해운대 근처 코워킹에서 바다 보면서 일하는 건 정말 행복해요.",
      createdAt: "2024-11-10",
      likes: 56,
      stayDuration: "6개월",
    },
    {
      id: "rv-busan-2",
      authorName: "마케터김",
      rating: 4,
      content: "KTX로 서울 출장 다니기도 편하고, 주말에 놀 곳도 많아요. 다만 여름 장마철에는 습도가 높아서 좀 힘들었어요.",
      createdAt: "2024-10-15",
      likes: 31,
      stayDuration: "3개월",
    },
    {
      id: "rv-busan-3",
      authorName: "디자이너윤",
      rating: 5,
      content: "감천문화마을, 해운대, 광안리... 영감 받을 곳이 너무 많아요. 맛집도 많아서 삶의 질이 확 올라갔습니다!",
      createdAt: "2024-09-01",
      likes: 44,
      stayDuration: "4개월",
    },
  ],
  gangneung: [
    {
      id: "rv-gang-1",
      authorName: "커피러버박",
      rating: 5,
      content: "커피의 도시답게 카페가 정말 많아요. 테라로사 본점에서 작업하는 건 최고의 경험이었습니다. 서울에서 KTX로 2시간!",
      createdAt: "2024-11-05",
      likes: 38,
      stayDuration: "1개월",
    },
    {
      id: "rv-gang-2",
      authorName: "프리랜서이",
      rating: 4,
      content: "물가가 저렴하고 바다가 가까워서 좋아요. 다만 겨울에는 정말 춥습니다. 봄~가을 추천드려요.",
      createdAt: "2024-08-20",
      likes: 22,
      stayDuration: "2개월",
    },
  ],
  daejeon: [
    {
      id: "rv-dj-1",
      authorName: "스타트업대표",
      rating: 4,
      content: "대전은 IT 인프라가 잘 갖춰져 있어요. 특히 유성구 쪽에 스타트업 지원 시설이 많아서 네트워킹하기 좋습니다.",
      createdAt: "2024-10-25",
      likes: 27,
      stayDuration: "2개월",
    },
    {
      id: "rv-dj-2",
      authorName: "개발자최",
      rating: 5,
      content: "서울까지 KTX 1시간! 출장이 많은 저에게 딱이에요. 물가도 서울의 70% 수준이라 만족스럽습니다.",
      createdAt: "2024-09-15",
      likes: 33,
      stayDuration: "4개월",
    },
  ],
  jeonju: [
    {
      id: "rv-jj-1",
      authorName: "푸드블로거",
      rating: 5,
      content: "맛있는 음식, 예쁜 한옥마을, 저렴한 물가... 3박자가 다 갖춰진 도시예요. 한옥마을 근처 카페에서 작업하는 것도 운치 있어요.",
      createdAt: "2024-11-01",
      likes: 41,
      stayDuration: "1개월",
    },
    {
      id: "rv-jj-2",
      authorName: "일러스트레이터",
      rating: 4,
      content: "전통과 현대가 조화로운 도시입니다. 영감을 받기 좋아요. 다만 코워킹 시설이 좀 부족한 편이에요.",
      createdAt: "2024-08-10",
      likes: 18,
      stayDuration: "3주",
    },
  ],
};

/**
 * 도시 ID로 작업공간 목록 조회
 */
export function getWorkspacesByCityId(cityId: string): Workspace[] {
  return workspaces[cityId] || [];
}

/**
 * 도시 ID로 교통 정보 조회
 */
export function getTransportationsByCityId(cityId: string): Transportation[] {
  return transportations[cityId] || [];
}

/**
 * 도시 ID로 리뷰 목록 조회
 */
export function getReviewsByCityId(cityId: string): Review[] {
  return reviews[cityId] || [];
}
