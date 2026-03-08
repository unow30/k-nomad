/**
 * 기상청 API 테스트 스크립트
 *
 * 사용법:
 * 1. .env 파일에 WEATHER_API_SERVICE_KEY 설정
 * 2. npx tsx scripts/test-weather-api.ts
 */

import 'dotenv/config';
import {
  fetchDailyWeatherData,
  getLastMonthRange,
  getMonthRange,
} from '../lib/weather-api';
import { calculateMonthlyAverage, validateMonthlyData } from '../lib/weather-calculator';

async function main() {
  console.log('🌤️  기상청 ASOS 일자료 API 테스트\n');

  // API 키 확인
  if (!process.env.WEATHER_API_SERVICE_KEY) {
    console.error('❌ WEATHER_API_SERVICE_KEY 환경변수가 설정되지 않았습니다.');
    console.error('   .env 파일에 다음을 추가하세요:');
    console.error('   WEATHER_API_SERVICE_KEY=발급받은_서비스키\n');
    process.exit(1);
  }

  try {
    // 1. 2026년 1월 서울 데이터 조회
    console.log('📡 서울(108) 관측소의 2026년 1월 데이터 조회 중...\n');

    const { startDate, endDate } = getMonthRange(2026, 1);
    console.log(`  - 기간: ${startDate} ~ ${endDate}`);

    const dailyData = await fetchDailyWeatherData(108, startDate, endDate);
    console.log(`  - 조회 결과: ${dailyData.length}일치 데이터\n`);

    if (dailyData.length === 0) {
      console.warn('⚠️  데이터가 없습니다. (미래 날짜이거나 관측소 미운영)\n');
      return;
    }

    // 샘플 데이터 출력 (첫 3일)
    console.log('📊 샘플 데이터 (첫 3일):');
    dailyData.slice(0, 3).forEach(day => {
      console.log(`  ${day.tm}: 평균 ${day.avgTa}℃, 최고 ${day.maxTa}℃, 최저 ${day.minTa}℃, 강수 ${day.sumRn}mm`);
    });
    console.log();

    // 2. 월별 평균 계산
    console.log('🧮 월별 평균 계산 중...\n');
    const monthlyData = calculateMonthlyAverage(dailyData);

    if (!monthlyData) {
      console.error('❌ 월별 평균 계산 실패 (모든 데이터가 결측값)\n');
      return;
    }

    console.log('✅ 월별 평균 계산 완료:');
    console.log(`  - 평균기온: ${monthlyData.avgTemp}℃`);
    console.log(`  - 최고기온: ${monthlyData.maxTemp}℃`);
    console.log(`  - 최저기온: ${monthlyData.minTemp}℃`);
    console.log(`  - 총강수량: ${monthlyData.rainfall}mm\n`);

    // 3. 데이터 검증
    const validation = validateMonthlyData(monthlyData);
    if (validation.valid) {
      console.log('✅ 데이터 검증 통과\n');
    } else {
      console.error('❌ 데이터 검증 실패:');
      validation.errors.forEach(err => console.error(`  - ${err}`));
      console.log();
    }

    // 4. 전월 데이터 조회 테스트
    console.log('📅 전월 데이터 조회 테스트...\n');
    const lastMonth = getLastMonthRange();
    console.log(`  - 기간: ${lastMonth.year}년 ${lastMonth.month}월`);
    console.log(`  - 날짜: ${lastMonth.startDate} ~ ${lastMonth.endDate}\n`);

    const lastMonthData = await fetchDailyWeatherData(
      108,
      lastMonth.startDate,
      lastMonth.endDate
    );
    console.log(`  - 조회 결과: ${lastMonthData.length}일치 데이터\n`);

    console.log('🎉 모든 테스트 완료!\n');

  } catch (error) {
    console.error('❌ 에러 발생:', error);
    if (error instanceof Error) {
      console.error('   메시지:', error.message);
      console.error('   스택:', error.stack);
    }
    process.exit(1);
  }
}

main();
