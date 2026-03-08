import { vi } from "vitest";

/**
 * Next.js Cache Mock
 *
 * 사용 예시:
 * - revalidatePath(path, layout)
 * - revalidateTag(tag)
 * - unstable_cache()
 */

// revalidatePath 함수 mock
export const revalidatePath = vi.fn((
  path: string,
  type?: "page" | "layout"
) => {
  return Promise.resolve();
});

// revalidateTag 함수 mock
export const revalidateTag = vi.fn((tag: string) => {
  return Promise.resolve();
});

// unstable_cache 함수 mock
export const unstable_cache = vi.fn((
  fn: Function,
  keyParts?: string[],
  options?: any
) => {
  return fn;
});

// 테스트 헬퍼: 호출 여부 확인
export const isRevalidatePathCalled = (path: string, type?: string) => {
  return revalidatePath.mock.calls.some(
    (call) => call[0] === path && call[1] === type
  );
};

// 테스트 헬퍼: Mock 초기화
export const resetCacheMocks = () => {
  revalidatePath.mockClear();
  revalidateTag.mockClear();
  unstable_cache.mockClear();
};
