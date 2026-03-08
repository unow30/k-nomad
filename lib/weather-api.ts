/**
 * 기상청 ASOS 일자료 API 클라이언트
 *
 * 공공데이터포털에서 제공하는 기상청_지상(종관, ASOS) 일자료 조회서비스를 통해
 * 특정 관측소의 일별 날씨 데이터를 조회합니다.
 *
 * API 문서: https://www.data.go.kr/data/15059093/openapi.do
 */

// ===========================================
// 타입 정의
// ===========================================

/**
 * ASOS 일자료 API 응답 타입
 */
export interface AsosDailyResponse {
  response: {
    header: {
      resultCode: string;  // "00" = 정상, 기타 = 에러
      resultMsg: string;   // 결과 메시지
    };
    body: {
      dataType: string;
      items: {
        item: AsosDailyItem[];
      };
      pageNo: number;
      numOfRows: number;
      totalCount: number;
    };
  };
}

/**
 * ASOS 일별 데이터 항목
 */
export interface AsosDailyItem {
  stnId: string;        // 지점번호 (예: "108")
  stnNm: string;        // 지점명 (예: "서울")
  tm: string;           // 일시 (YYYYMMDD)
  avgTa: string;        // 평균기온 (℃)
  minTa: string;        // 최저기온 (℃)
  maxTa: string;        // 최고기온 (℃)
  sumRn: string;        // 일강수량 (mm)
  avgRhm?: string;      // 평균습도 (%)
  avgWs?: string;       // 평균풍속 (m/s)
  avgPa?: string;       // 평균기압 (hPa)
  [key: string]: string | undefined;  // 기타 50+ 필드
}

/**
 * API 에러 타입
 */
export class WeatherApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'WeatherApiError';
  }
}

// ===========================================
// 환경변수 검증
// ===========================================

function getServiceKey(): string {
  const serviceKey = process.env.WEATHER_API_SERVICE_KEY;
  if (!serviceKey) {
    throw new WeatherApiError(
      'WEATHER_API_SERVICE_KEY 환경변수가 설정되지 않았습니다.',
      'MISSING_API_KEY'
    );
  }
  return serviceKey;
}

// ===========================================
// API 호출 함수
// ===========================================

/**
 * 기상청 ASOS 일자료 조회
 *
 * @param stationId - 관측소 지점번호 (예: 108 = 서울)
 * @param startDate - 시작일 (YYYYMMDD)
 * @param endDate - 종료일 (YYYYMMDD)
 * @param options - 추가 옵션 (재시도, 타임아웃 등)
 * @returns 일별 날씨 데이터 배열
 *
 * @example
 * const data = await fetchDailyWeatherData(108, '20260101', '20260131');
 */
export async function fetchDailyWeatherData(
  stationId: number,
  startDate: string,
  endDate: string,
  options: {
    retries?: number;
    timeout?: number;
  } = {}
): Promise<AsosDailyItem[]> {
  const { retries = 3, timeout = 10000 } = options;

  // 날짜 범위 검증 (최대 31일)
  const start = new Date(
    parseInt(startDate.slice(0, 4)),
    parseInt(startDate.slice(4, 6)) - 1,
    parseInt(startDate.slice(6, 8))
  );
  const end = new Date(
    parseInt(endDate.slice(0, 4)),
    parseInt(endDate.slice(4, 6)) - 1,
    parseInt(endDate.slice(6, 8))
  );
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff > 31) {
    throw new WeatherApiError(
      '날짜 범위는 최대 31일까지만 조회 가능합니다.',
      'INVALID_DATE_RANGE'
    );
  }

  let lastError: Error | null = null;

  // 재시도 로직
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await fetchWithTimeout(stationId, startDate, endDate, timeout);
      return data;
    } catch (error) {
      lastError = error as Error;

      // 마지막 시도가 아니면 재시도
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.warn(
          `[WeatherAPI] 재시도 ${attempt + 1}/${retries} (${delay}ms 후)`,
          error
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // 모든 재시도 실패
  throw new WeatherApiError(
    `날씨 데이터 조회 실패 (${retries}회 재시도): ${lastError?.message}`,
    'FETCH_FAILED',
    500
  );
}

/**
 * 타임아웃을 적용한 API 호출
 */
async function fetchWithTimeout(
  stationId: number,
  startDate: string,
  endDate: string,
  timeout: number
): Promise<AsosDailyItem[]> {
  const serviceKey = getServiceKey();

  // API URL 구성
  const url = new URL('http://apis.data.go.kr/1360000/AsosDalyInfoService/getWthrDataList');
  url.searchParams.append('serviceKey', serviceKey);
  url.searchParams.append('dataType', 'JSON');
  url.searchParams.append('dataCd', 'ASOS');
  url.searchParams.append('dateCd', 'DAY');
  url.searchParams.append('startDt', startDate);
  url.searchParams.append('endDt', endDate);
  url.searchParams.append('stnIds', stationId.toString());
  url.searchParams.append('numOfRows', '999');  // 최대 999개 (31일 충분)
  url.searchParams.append('pageNo', '1');

  // Fetch with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new WeatherApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        'HTTP_ERROR',
        response.status
      );
    }

    const data: AsosDailyResponse = await response.json();

    // API 응답 코드 검증
    if (data.response.header.resultCode !== '00') {
      throw new WeatherApiError(
        `API 에러: ${data.response.header.resultMsg}`,
        data.response.header.resultCode
      );
    }

    // 데이터 추출
    const items = data.response.body.items?.item || [];

    if (items.length === 0) {
      console.warn(
        `[WeatherAPI] 관측소 ${stationId}의 ${startDate}~${endDate} 데이터가 없습니다.`
      );
    }

    return items;

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof WeatherApiError) {
      throw error;
    }

    if ((error as Error).name === 'AbortError') {
      throw new WeatherApiError(
        `요청 시간 초과 (${timeout}ms)`,
        'TIMEOUT'
      );
    }

    throw new WeatherApiError(
      `네트워크 에러: ${(error as Error).message}`,
      'NETWORK_ERROR'
    );
  }
}

// ===========================================
// 유틸리티 함수
// ===========================================

/**
 * 날짜를 YYYYMMDD 형식으로 변환
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * 특정 월의 시작일과 종료일 반환
 */
export function getMonthRange(year: number, month: number): {
  startDate: string;
  endDate: string;
} {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0); // 다음 달 0일 = 이번 달 마지막 날

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

/**
 * 전월 데이터 조회를 위한 날짜 범위 생성
 */
export function getLastMonthRange(): {
  year: number;
  month: number;
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = lastMonth.getFullYear();
  const month = lastMonth.getMonth() + 1;

  const { startDate, endDate } = getMonthRange(year, month);

  return { year, month, startDate, endDate };
}
