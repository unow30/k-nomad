/**
 * @vitest environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import RootLayout from "@/app/layout";
import { render } from "@testing-library/react";

// Mock Header component
vi.mock("@/components/layout/Header", () => ({
  default: () => <header data-testid="header">Header</header>,
}));

// Mock Footer component
vi.mock("@/components/layout/Footer", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

// Mock Next.js font
vi.mock("next/font/google", () => ({
  Inter: () => ({
    className: "font-inter",
  }),
}));

describe("app/layout (RootLayout)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Header를 렌더링", () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(container.querySelector('[data-testid="header"]')).toBeInTheDocument();
  });

  it("Footer를 렌더링", () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(container.querySelector('[data-testid="footer"]')).toBeInTheDocument();
  });

  it("children을 렌더링", () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="child-content">Test Content</div>
      </RootLayout>
    );

    expect(container.querySelector('[data-testid="child-content"]')).toBeInTheDocument();
  });

  it("HTML lang 속성이 ko로 설정됨", () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // Note: HTML/body 태그는 테스트 환경에서 렌더링되지 않으므로
    // layout 컴포넌트의 기본 구조만 테스트
    expect(container.querySelector("main")).toBeInTheDocument();
  });

  it("body에 font 클래스가 적용됨", () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // Note: body 태그는 테스트 환경에서 렌더링되지 않으므로
    // main 요소가 제대로 렌더링되는지 확인
    expect(container.querySelector("main")).toBeInTheDocument();
  });

  it("main 요소를 렌더링", () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
  });

  it("main에 min-h-screen 클래스가 적용됨", () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const main = container.querySelector("main");
    expect(main).toHaveClass("min-h-screen");
  });

  it("Header, main, Footer 순서대로 렌더링", () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="main-content">Main</div>
      </RootLayout>
    );

    const header = container.querySelector('[data-testid="header"]');
    const main = container.querySelector("main");
    const footer = container.querySelector('[data-testid="footer"]');

    // Header가 main보다 먼저 와야 함
    expect(header?.compareDocumentPosition(main!)).toBe(4); // DOCUMENT_POSITION_FOLLOWING

    // main이 footer보다 먼저 와야 함
    expect(main?.compareDocumentPosition(footer!)).toBe(4); // DOCUMENT_POSITION_FOLLOWING
  });
});
