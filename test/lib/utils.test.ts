import { describe, it, expect } from "vitest";
import {
  cn,
  getAQILabel,
  getAQIColor,
  getScoreColor,
  formatKoreanNumber,
  getBudgetLabel,
  getEnvironmentLabel,
  getSeasonLabel,
  getSeasonEmoji,
} from "@/lib/utils";

describe("lib/utils", () => {
  describe("cn() - Tailwind 클래스 병합", () => {
    it("여러 클래스를 병합해야 함", () => {
      const result = cn("px-2", "py-1", "bg-red-500");
      expect(result).toContain("px-2");
      expect(result).toContain("py-1");
      expect(result).toContain("bg-red-500");
    });

    it("조건부 클래스를 처리해야 함", () => {
      const result = cn("px-2", true && "py-1", false && "bg-red-500");
      expect(result).toContain("px-2");
      expect(result).toContain("py-1");
      expect(result).not.toContain("bg-red-500");
    });

    it("충돌하는 Tailwind 클래스를 merge해야 함", () => {
      const result = cn("bg-red-500", "bg-blue-500");
      expect(result).toContain("bg-blue-500");
      expect(result).not.toContain("bg-red-500");
    });

    it("padding 클래스를 merge해야 함", () => {
      const result = cn("px-2 py-1", "px-4");
      expect(result).toContain("px-4");
    });
  });

  describe("getAQILabel() - AQI 라벨 변환", () => {
    it("AQI 0-50은 '좋음' 반환", () => {
      expect(getAQILabel(0)).toBe("좋음");
      expect(getAQILabel(25)).toBe("좋음");
      expect(getAQILabel(50)).toBe("좋음");
    });

    it("AQI 51-100은 '보통' 반환", () => {
      expect(getAQILabel(51)).toBe("보통");
      expect(getAQILabel(75)).toBe("보통");
      expect(getAQILabel(100)).toBe("보통");
    });

    it("AQI 101-150은 '나쁨' 반환", () => {
      expect(getAQILabel(101)).toBe("나쁨");
      expect(getAQILabel(125)).toBe("나쁨");
      expect(getAQILabel(150)).toBe("나쁨");
    });

    it("AQI 151 이상은 '매우나쁨' 반환", () => {
      expect(getAQILabel(151)).toBe("매우나쁨");
      expect(getAQILabel(200)).toBe("매우나쁨");
      expect(getAQILabel(500)).toBe("매우나쁨");
    });
  });

  describe("getAQIColor() - AQI 색상 클래스", () => {
    it("AQI 0-50은 'text-green-600' 반환", () => {
      expect(getAQIColor(0)).toBe("text-green-600");
      expect(getAQIColor(50)).toBe("text-green-600");
    });

    it("AQI 51-100은 'text-yellow-600' 반환", () => {
      expect(getAQIColor(51)).toBe("text-yellow-600");
      expect(getAQIColor(100)).toBe("text-yellow-600");
    });

    it("AQI 101-150은 'text-orange-600' 반환", () => {
      expect(getAQIColor(101)).toBe("text-orange-600");
      expect(getAQIColor(150)).toBe("text-orange-600");
    });

    it("AQI 151 이상은 'text-red-600' 반환", () => {
      expect(getAQIColor(151)).toBe("text-red-600");
      expect(getAQIColor(200)).toBe("text-red-600");
    });
  });

  describe("getScoreColor() - 점수 색상 클래스", () => {
    it("점수 4.5 이상은 'text-green-600' 반환", () => {
      expect(getScoreColor(4.5)).toBe("text-green-600");
      expect(getScoreColor(5.0)).toBe("text-green-600");
    });

    it("점수 3.5-4.49는 'text-yellow-600' 반환", () => {
      expect(getScoreColor(3.5)).toBe("text-yellow-600");
      expect(getScoreColor(4.0)).toBe("text-yellow-600");
      expect(getScoreColor(4.49)).toBe("text-yellow-600");
    });

    it("점수 2.5-3.49는 'text-orange-600' 반환", () => {
      expect(getScoreColor(2.5)).toBe("text-orange-600");
      expect(getScoreColor(3.0)).toBe("text-orange-600");
      expect(getScoreColor(3.49)).toBe("text-orange-600");
    });

    it("점수 2.5 미만은 'text-red-600' 반환", () => {
      expect(getScoreColor(1.0)).toBe("text-red-600");
      expect(getScoreColor(2.49)).toBe("text-red-600");
    });
  });

  describe("formatKoreanNumber() - 한국식 숫자 포맷", () => {
    it("만원 단위로 포맷해야 함", () => {
      expect(formatKoreanNumber(10000)).toBe("1만");
      expect(formatKoreanNumber(100000)).toBe("10만");
      expect(formatKoreanNumber(1000000)).toBe("100만");
      expect(formatKoreanNumber(1500000)).toBe("150만");
    });

    it("10,000 미만은 toLocaleString 반환", () => {
      expect(formatKoreanNumber(1000)).toBe("1,000");
      expect(formatKoreanNumber(5000)).toBe("5,000");
      expect(formatKoreanNumber(9999)).toBe("9,999");
    });

    it("0은 '0' 반환", () => {
      expect(formatKoreanNumber(0)).toBe("0");
    });

    it("1만 정확히 반환", () => {
      expect(formatKoreanNumber(10000)).toBe("1만");
    });
  });

  describe("getBudgetLabel() - 예산 레이블", () => {
    it("'under100' 예산을 '100만원 이하'로 변환", () => {
      expect(getBudgetLabel("under100")).toBe("100만원 이하");
    });

    it("'100to200' 예산을 '100~200만원'으로 변환", () => {
      expect(getBudgetLabel("100to200")).toBe("100~200만원");
    });

    it("'over200' 예산을 '200만원 이상'으로 변환", () => {
      expect(getBudgetLabel("over200")).toBe("200만원 이상");
    });

    it("존재하지 않는 예산을 원본 반환", () => {
      expect(getBudgetLabel("invalid" as any)).toBe("invalid");
    });
  });

  describe("getEnvironmentLabel() - 환경 레이블", () => {
    it("'nature' 환경을 '자연친화'로 변환", () => {
      expect(getEnvironmentLabel("nature")).toBe("자연친화");
    });

    it("'urban' 환경을 '도심선호'로 변환", () => {
      expect(getEnvironmentLabel("urban")).toBe("도심선호");
    });

    it("'cafe' 환경을 '카페작업'으로 변환", () => {
      expect(getEnvironmentLabel("cafe")).toBe("카페작업");
    });

    it("'coworking' 환경을 '코워킹 필수'로 변환", () => {
      expect(getEnvironmentLabel("coworking")).toBe("코워킹 필수");
    });

    it("존재하지 않는 환경을 원본 반환", () => {
      expect(getEnvironmentLabel("invalid" as any)).toBe("invalid");
    });
  });

  describe("getSeasonLabel() - 계절 레이블", () => {
    it("'spring' 계절을 '봄'으로 변환", () => {
      expect(getSeasonLabel("spring")).toBe("봄");
    });

    it("'summer' 계절을 '여름'으로 변환", () => {
      expect(getSeasonLabel("summer")).toBe("여름");
    });

    it("'fall' 계절을 '가을'로 변환", () => {
      expect(getSeasonLabel("fall")).toBe("가을");
    });

    it("'winter' 계절을 '겨울'로 변환", () => {
      expect(getSeasonLabel("winter")).toBe("겨울");
    });

    it("존재하지 않는 계절을 원본 반환", () => {
      expect(getSeasonLabel("invalid" as any)).toBe("invalid");
    });
  });

  describe("getSeasonEmoji() - 계절 이모지", () => {
    it("'spring' 계절은 '🌸' 반환", () => {
      expect(getSeasonEmoji("spring")).toBe("🌸");
    });

    it("'summer' 계절은 '☀️' 반환", () => {
      expect(getSeasonEmoji("summer")).toBe("☀️");
    });

    it("'fall' 계절은 '🍂' 반환", () => {
      expect(getSeasonEmoji("fall")).toBe("🍂");
    });

    it("'winter' 계절은 '❄️' 반환", () => {
      expect(getSeasonEmoji("winter")).toBe("❄️");
    });

    it("존재하지 않는 계절은 '🌸' 기본값 반환", () => {
      expect(getSeasonEmoji("invalid" as any)).toBe("🌸");
    });
  });
});
