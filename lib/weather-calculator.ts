/**
 * 월별 날씨 데이터 계산 로직
 *
 * 기상청 ASOS 일자료 API로 조회한 일별 데이터를 월별 평균으로 계산합니다.
 */

import type { AsosDailyItem } from './weather-api';

// ===========================================
// 타입 정의
// ===========================================

/**
 * 월별 평균 날씨 데이터
 */
export interface MonthlyWeatherData {
  avgTemp: number;      // 평균기온 (℃)
  maxTemp: number;      // 최고기온 (℃)
  minTemp: number;      // 최저기온 (℃)
  rainfall: number;     // 총강수량 (mm)
}

// ===========================================
// 계산 함수
// ===========================================

/**
 * 일별 데이터에서 월별 평균 계산
 *
 * @param dailyData - ASOS 일자료 배열
 * @returns 월별 평균 데이터 (결측값이 모두인 경우 null)
 *
 * @example
 * const dailyData = await fetchDailyWeatherData(108, '20260101', '20260131');
 * const monthly = calculateMonthlyAverage(dailyData);
 * // { avgTemp: -2.3, maxTemp: 5.2, minTemp: -8.1, rainfall: 12.5 }
 */
export function calculateMonthlyAverage(
  dailyData: AsosDailyItem[]
): MonthlyWeatherData | null {
  if (dailyData.length === 0) {
    return null;
  }

  // 유효한 데이터만 필터링
  const validAvgTemps = filterValidNumbers(dailyData.map(d => d.avgTa));
  const validMaxTemps = filterValidNumbers(dailyData.map(d => d.maxTa));
  const validMinTemps = filterValidNumbers(dailyData.map(d => d.minTa));
  const validRainfalls = filterValidNumbers(dailyData.map(d => d.sumRn));

  // 모든 데이터가 결측값인 경우
  if (
    validAvgTemps.length === 0 &&
    validMaxTemps.length === 0 &&
    validMinTemps.length === 0
  ) {
    return null;
  }

  // 평균기온: 일별 평균기온의 평균
  const avgTemp = validAvgTemps.length > 0
    ? average(validAvgTemps)
    : 0;

  // 최고기온: 일별 최고기온 중 최댓값
  const maxTemp = validMaxTemps.length > 0
    ? Math.max(...validMaxTemps)
    : 0;

  // 최저기온: 일별 최저기온 중 최솟값
  const minTemp = validMinTemps.length > 0
    ? Math.min(...validMinTemps)
    : 0;

  // 총강수량: 일별 강수량의 합계
  const rainfall = validRainfalls.length > 0
    ? sum(validRainfalls)
    : 0;

  return {
    avgTemp: round(avgTemp, 1),
    maxTemp: round(maxTemp, 1),
    minTemp: round(minTemp, 1),
    rainfall: round(rainfall, 1),
  };
}

// ===========================================
// 유틸리티 함수
// ===========================================

/**
 * 문자열 배열을 숫자 배열로 변환 (결측값 제외)
 */
function filterValidNumbers(values: (string | undefined)[]): number[] {
  return values
    .map(v => {
      if (!v || v.trim() === '' || v === 'null' || v === 'undefined') {
        return null;
      }
      const num = parseFloat(v);
      return isNaN(num) ? null : num;
    })
    .filter((n): n is number => n !== null);
}

/**
 * 평균 계산
 */
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return sum(numbers) / numbers.length;
}

/**
 * 합계 계산
 */
function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

/**
 * 반올림 (소수점 자릿수 지정)
 */
function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ===========================================
// 데이터 검증
// ===========================================

/**
 * 월별 데이터 유효성 검사
 */
export function validateMonthlyData(
  data: MonthlyWeatherData
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 기온 범위 검증 (-50°C ~ 50°C)
  if (data.avgTemp < -50 || data.avgTemp > 50) {
    errors.push(`평균기온이 비정상 범위입니다: ${data.avgTemp}℃`);
  }
  if (data.maxTemp < -50 || data.maxTemp > 50) {
    errors.push(`최고기온이 비정상 범위입니다: ${data.maxTemp}℃`);
  }
  if (data.minTemp < -50 || data.minTemp > 50) {
    errors.push(`최저기온이 비정상 범위입니다: ${data.minTemp}℃`);
  }

  // 기온 관계 검증 (minTemp <= avgTemp <= maxTemp)
  if (data.minTemp > data.avgTemp) {
    errors.push(
      `최저기온(${data.minTemp})이 평균기온(${data.avgTemp})보다 높습니다.`
    );
  }
  if (data.maxTemp < data.avgTemp) {
    errors.push(
      `최고기온(${data.maxTemp})이 평균기온(${data.avgTemp})보다 낮습니다.`
    );
  }

  // 강수량 범위 검증 (0 ~ 1000mm)
  if (data.rainfall < 0 || data.rainfall > 1000) {
    errors.push(`강수량이 비정상 범위입니다: ${data.rainfall}mm`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
