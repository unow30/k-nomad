import { vi } from "vitest";

/**
 * Next.js Navigation Mock
 *
 * 사용 예시:
 * - redirect(url) - throw Error로 구현됨
 * - useRouter() - router.push() 지원
 * - useSearchParams() - 쿼리 파라미터 조회
 * - usePathname() - 현재 경로 조회
 */

// URL 쿼리 파라미터 클래스 Mock
export class URLSearchParams {
  private params: Map<string, string> = new Map();

  constructor(init?: URLSearchParams | Record<string, string> | string) {
    if (init instanceof URLSearchParams) {
      for (const [key, value] of init) {
        this.params.set(key, value);
      }
    } else if (typeof init === "string") {
      const pairs = init.split("&");
      for (const pair of pairs) {
        const [key, value] = pair.split("=");
        if (key) {
          this.params.set(
            decodeURIComponent(key),
            value ? decodeURIComponent(value) : ""
          );
        }
      }
    } else if (init && typeof init === "object") {
      for (const [key, value] of Object.entries(init)) {
        this.params.set(key, String(value));
      }
    }
  }

  get(key: string): string | null {
    return this.params.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.params.set(key, value);
  }

  delete(key: string): void {
    this.params.delete(key);
  }

  toString(): string {
    const pairs: string[] = [];
    for (const [key, value] of this.params) {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
    return pairs.join("&");
  }

  [Symbol.iterator](): Iterator<[string, string]> {
    return this.params[Symbol.iterator]();
  }
}

// redirect 함수 - throw Error로 구현
export const redirect = vi.fn((url: string) => {
  const error = new Error(`NEXT_REDIRECT: ${url}`);
  (error as any).digest = "NEXT_REDIRECT";
  throw error;
});

// useRouter Hook Mock
export const useRouter = vi.fn(() => ({
  push: vi.fn().mockResolvedValue(undefined),
  replace: vi.fn().mockResolvedValue(undefined),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
}));

// useSearchParams Hook Mock
let mockSearchParams = new URLSearchParams();

export const useSearchParams = vi.fn(() => {
  return mockSearchParams;
});

// usePathname Hook Mock
export const usePathname = vi.fn(() => "/");

// 테스트에서 searchParams를 설정하는 헬퍼 함수
export const setMockSearchParams = (params: Record<string, string>) => {
  mockSearchParams = new URLSearchParams(params);
};

// 테스트에서 searchParams를 초기화하는 헬퍼 함수
export const resetMockSearchParams = () => {
  mockSearchParams = new URLSearchParams();
};
