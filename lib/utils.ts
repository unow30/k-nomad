import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import type { BudgetRange, Environment, BestSeason, AqiLabelType } from "@/types/city";
import {
  BUDGET_OPTIONS,
  ENVIRONMENT_OPTIONS,
  SEASON_OPTIONS,
} from "@/types/city";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Supabase Storage 업로드 경로 생성
 * 형식: YYYYMMDD/HHmmdd-{random10}.{ext}
 */
export function generateStoragePath(filename: string): string {
  const ymd = dayjs().format("YYYYMMDD");
  const ts = dayjs().format("HHmmss");
  const ran = crypto.randomUUID().replaceAll("-", "").substring(0, 10);
  const ext = filename.split(".").pop() || "jpg";
  return `${ymd}/${ts}-${ran}.${ext}`;
}

/**
 * AQI 값에 따른 라벨 반환
 */
export function getAQILabel(aqi: number): AqiLabelType {
  if (aqi <= 50) return "좋음";
  if (aqi <= 100) return "보통";
  if (aqi <= 150) return "나쁨";
  return "매우나쁨";
}

/**
 * AQI 값에 따른 색상 클래스 반환
 */
export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "text-green-600";
  if (aqi <= 100) return "text-yellow-600";
  if (aqi <= 150) return "text-orange-600";
  return "text-red-600";
}

/**
 * 점수를 바탕으로 색상 클래스 반환 (1-5 스케일)
 */
export function getScoreColor(score: number): string {
  if (score >= 4.5) return "text-green-600";
  if (score >= 3.5) return "text-yellow-600";
  if (score >= 2.5) return "text-orange-600";
  return "text-red-600";
}

/**
 * 숫자를 한국식 형식으로 포맷 (예: 1500000 -> 150만원)
 */
export function formatKoreanNumber(num: number): string {
  if (num >= 10000) {
    return `${Math.floor(num / 10000)}만`;
  }
  return num.toLocaleString("ko-KR");
}

/**
 * 예산 범위 값을 한글 레이블로 변환
 */
export function getBudgetLabel(budget: BudgetRange): string {
  return BUDGET_OPTIONS.find((opt) => opt.value === budget)?.label ?? budget;
}

/**
 * 환경 값을 한글 레이블로 변환
 */
export function getEnvironmentLabel(environment: Environment): string {
  return (
    ENVIRONMENT_OPTIONS.find((opt) => opt.value === environment)?.label ??
    environment
  );
}

/**
 * 계절 값을 한글 레이블로 변환
 */
export function getSeasonLabel(season: BestSeason): string {
  return SEASON_OPTIONS.find((opt) => opt.value === season)?.label ?? season;
}

/**
 * 계절에 따른 이모지 반환
 */
export function getSeasonEmoji(season: BestSeason): string {
  const emojiMap: Record<BestSeason, string> = {
    spring: "🌸",
    summer: "☀️",
    fall: "🍂",
    winter: "❄️",
  };
  return emojiMap[season] ?? "🌸";
}

/**
 * 강수량에 따른 아이콘 반환
 */
export function getRainfallIcon(rainfall: number): string {
  if (rainfall === 0) return "☀️";
  if (rainfall < 50) return "🌤️";
  if (rainfall < 100) return "🌧️";
  return "⛈️";
}

/**
 * 강수량에 따른 라벨 반환
 */
export function getRainfallLabel(rainfall: number): string {
  if (rainfall === 0) return "강수 없음";
  if (rainfall < 50) return "약한 비";
  if (rainfall < 100) return "보통 비";
  return "많은 비";
}
