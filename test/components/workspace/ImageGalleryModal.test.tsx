/**
 * @vitest environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ImageGalleryModal from "@/components/workspace/ImageGalleryModal";

vi.mock("next/image", () => ({
  default: ({ src, alt }: any) => (
    <img src={src} alt={alt} data-testid="gallery-image" />
  ),
}));

vi.mock("@radix-ui/react-dialog", () => ({
  Content: ({ children, ...props }: any) => (
    <div data-testid="dialog-primitive-content" {...props}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) =>
    open ? <div data-testid="dialog-root">{children}</div> : null,
  DialogPortal: ({ children }: any) => <>{children}</>,
  DialogOverlay: () => <div data-testid="dialog-overlay" />,
  DialogClose: ({ children, className, ...props }: any) => (
    <button data-testid="dialog-close" className={className} {...props}>
      {children}
    </button>
  ),
  DialogTitle: ({ children, className }: any) => (
    <h2 className={className}>{children}</h2>
  ),
}));

vi.mock("lucide-react", () => ({
  ChevronLeft: () => <span data-testid="chevron-left" />,
  ChevronRight: () => <span data-testid="chevron-right" />,
  X: () => <span data-testid="x-icon" />,
}));

const mockImages = [
  {
    id: "img-1",
    image_url: "http://example.com/img1.jpg",
    caption: "첫 번째 이미지",
    display_order: 0,
  },
  {
    id: "img-2",
    image_url: "http://example.com/img2.jpg",
    caption: null,
    display_order: 1,
  },
  {
    id: "img-3",
    image_url: "http://example.com/img3.jpg",
    caption: "세 번째 이미지",
    display_order: 2,
  },
];

describe("ImageGalleryModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("open=false → 아무것도 렌더링하지 않음", () => {
    render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={0}
        open={false}
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.queryByTestId("gallery-image")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dialog-root")).not.toBeInTheDocument();
  });

  it("open=true → 현재 이미지(images[initialIndex]) 표시", () => {
    render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={0}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    const img = screen.getByTestId("gallery-image");
    expect(img).toHaveAttribute("src", "http://example.com/img1.jpg");
  });

  it("initialIndex=1 → 두 번째 이미지 표시", () => {
    render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={1}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    const img = screen.getByTestId("gallery-image");
    expect(img).toHaveAttribute("src", "http://example.com/img2.jpg");
  });

  it("이미지 1개 → 이전/다음 버튼 미표시", () => {
    render(
      <ImageGalleryModal
        images={[mockImages[0]]}
        initialIndex={0}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    expect(
      screen.queryByRole("button", { name: "이전 이미지" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "다음 이미지" })
    ).not.toBeInTheDocument();
  });

  it("initialIndex=0 → 이전 버튼 없음, 다음 버튼 있음", () => {
    render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={0}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    expect(
      screen.queryByRole("button", { name: "이전 이미지" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "다음 이미지" })
    ).toBeInTheDocument();
  });

  it("initialIndex=마지막 → 이전 버튼 있음, 다음 버튼 없음", () => {
    render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={2}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    expect(
      screen.getByRole("button", { name: "이전 이미지" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "다음 이미지" })
    ).not.toBeInTheDocument();
  });

  it("다음 버튼(aria-label=다음 이미지) 클릭 → 다음 이미지 표시", () => {
    render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={0}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "다음 이미지" }));
    expect(screen.getByTestId("gallery-image")).toHaveAttribute(
      "src",
      "http://example.com/img2.jpg"
    );
  });

  it("이전 버튼(aria-label=이전 이미지) 클릭 → 이전 이미지 표시", () => {
    render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={1}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "이전 이미지" }));
    expect(screen.getByTestId("gallery-image")).toHaveAttribute(
      "src",
      "http://example.com/img1.jpg"
    );
  });

  it("{currentIndex+1} / {images.length} 카운터 표시 (이미지 2개 이상)", () => {
    render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={0}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("다음 이미지로 이동 시 카운터 업데이트", () => {
    render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={0}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "다음 이미지" }));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("이미지 1개 → 카운터 미표시", () => {
    render(
      <ImageGalleryModal
        images={[mockImages[0]]}
        initialIndex={0}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.queryByText("1 / 1")).not.toBeInTheDocument();
  });

  it("caption이 있으면 표시", () => {
    render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={0}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.getByText("첫 번째 이미지")).toBeInTheDocument();
  });

  it("caption이 null이면 해당 캡션 텍스트 미표시", () => {
    render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={1}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    // caption이 null → 빈 문자열 렌더링
    expect(screen.queryByText("두 번째 이미지")).not.toBeInTheDocument();
    // 다른 이미지 캡션도 표시되지 않아야 함
    expect(screen.queryByText("첫 번째 이미지")).not.toBeInTheDocument();
  });

  it("ArrowRight 키 → 다음 이미지", () => {
    render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={0}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByTestId("gallery-image")).toHaveAttribute(
      "src",
      "http://example.com/img2.jpg"
    );
  });

  it("ArrowLeft 키 → 이전 이미지", () => {
    render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={1}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByTestId("gallery-image")).toHaveAttribute(
      "src",
      "http://example.com/img1.jpg"
    );
  });

  it("마지막 이미지에서 ArrowRight → 인덱스 유지", () => {
    render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={2}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByTestId("gallery-image")).toHaveAttribute(
      "src",
      "http://example.com/img3.jpg"
    );
  });

  it("첫 번째 이미지에서 ArrowLeft → 인덱스 유지", () => {
    render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={0}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByTestId("gallery-image")).toHaveAttribute(
      "src",
      "http://example.com/img1.jpg"
    );
  });

  it("open=false 상태에서는 키보드 이벤트 무시", () => {
    const { rerender } = render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={0}
        open={false}
        onOpenChange={vi.fn()}
      />
    );
    // open=true로 변경 후 다시 false로
    rerender(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={0}
        open={false}
        onOpenChange={vi.fn()}
      />
    );
    fireEvent.keyDown(window, { key: "ArrowRight" });
    // 아무것도 렌더링되지 않아야 함
    expect(screen.queryByTestId("gallery-image")).not.toBeInTheDocument();
  });

  it("initialIndex prop 변경 시 현재 이미지 업데이트", () => {
    const { rerender } = render(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={0}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.getByTestId("gallery-image")).toHaveAttribute(
      "src",
      "http://example.com/img1.jpg"
    );

    rerender(
      <ImageGalleryModal
        images={mockImages}
        initialIndex={2}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.getByTestId("gallery-image")).toHaveAttribute(
      "src",
      "http://example.com/img3.jpg"
    );
  });
});
