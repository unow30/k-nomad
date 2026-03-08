/**
 * 데이터베이스 ENUM 타입들
 * database.types.ts의 Database["public"]["Enums"]와 동기화
 */

/**
 * 미세먼지 등급
 */
export enum AqiLabelType {
  Good = "좋음",
  Moderate = "보통",
  Bad = "나쁨",
  VeryBad = "매우나쁨",
}

/**
 * 환경 타입
 */
export enum EnvironmentType {
  Nature = "nature",
  Urban = "urban",
  Cafe = "cafe",
  Coworking = "coworking",
}

/**
 * 지역 타입
 */
export enum RegionType {
  Jeju = "jeju",
  Gyeongsang = "gyeongsang",
  Gangwon = "gangwon",
  Jeolla = "jeolla",
  Chungcheong = "chungcheong",
  Seoul = "seoul",
  Gyeonggi = "gyeonggi",
}

/**
 * 계절 타입
 */
export enum SeasonType {
  Spring = "spring",
  Summer = "summer",
  Fall = "fall",
  Winter = "winter",
}
