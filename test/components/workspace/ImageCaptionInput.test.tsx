/**
 * @vitest environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ImageCaptionInput from "@/components/workspace/ImageCaptionInput";

vi.mock("@/components/ui/textarea", () => ({
  Textarea: ({ id, value, onChange, maxLength, rows, ...props }: any) => (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      rows={rows}
      {...props}
    />
  ),
}));

describe("ImageCaptionInput", () => {
  const createFile = (name: string) =>
    new File(["content"], name, { type: "image/jpeg" });

  const defaultProps = {
    imageFile: createFile("test-image.jpg"),
    preview: "blob:http://localhost/preview-url",
    caption: "테스트 캡션",
    onCaptionChange: vi.fn(),
    index: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("이미지 미리보기 src가 preview prop과 일치", () => {
    render(<ImageCaptionInput {...defaultProps} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", defaultProps.preview);
  });

  it('"이미지 1" 라벨 표시 (index=0)', () => {
    render(<ImageCaptionInput {...defaultProps} index={0} />);
    expect(screen.getByText("이미지 1")).toBeInTheDocument();
  });

  it('"이미지 3" 라벨 표시 (index=2)', () => {
    render(<ImageCaptionInput {...defaultProps} index={2} />);
    expect(screen.getByText("이미지 3")).toBeInTheDocument();
  });

  it("imageFile.name 파일명 표시", () => {
    render(<ImageCaptionInput {...defaultProps} />);
    expect(screen.getByText("test-image.jpg")).toBeInTheDocument();
  });

  it("textarea id가 caption-{index} 형식 (index=0)", () => {
    render(<ImageCaptionInput {...defaultProps} index={0} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("id", "caption-0");
  });

  it("textarea id가 caption-{index} 형식 (index=2)", () => {
    render(<ImageCaptionInput {...defaultProps} index={2} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("id", "caption-2");
  });

  it("초기 caption 값이 textarea에 표시", () => {
    render(<ImageCaptionInput {...defaultProps} caption="초기 캡션 내용" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("초기 캡션 내용");
  });

  it("빈 caption일 때 textarea가 비어있음", () => {
    render(<ImageCaptionInput {...defaultProps} caption="" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("");
  });

  it("{caption.length}/500 문자수 카운터 표시", () => {
    render(<ImageCaptionInput {...defaultProps} caption="abc" />);
    expect(screen.getByText("3/500")).toBeInTheDocument();
  });

  it("빈 caption일 때 0/500 표시", () => {
    render(<ImageCaptionInput {...defaultProps} caption="" />);
    expect(screen.getByText("0/500")).toBeInTheDocument();
  });

  it("긴 caption의 글자수 카운터가 올바르게 표시", () => {
    const longCaption = "a".repeat(100);
    render(<ImageCaptionInput {...defaultProps} caption={longCaption} />);
    expect(screen.getByText("100/500")).toBeInTheDocument();
  });

  it("textarea 입력 시 onCaptionChange 콜백 호출", () => {
    const onCaptionChange = vi.fn();
    render(
      <ImageCaptionInput {...defaultProps} onCaptionChange={onCaptionChange} />
    );
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "새 캡션" } });
    expect(onCaptionChange).toHaveBeenCalledWith("새 캡션");
  });

  it("onCaptionChange가 입력값으로 정확히 호출됨", () => {
    const onCaptionChange = vi.fn();
    render(
      <ImageCaptionInput {...defaultProps} onCaptionChange={onCaptionChange} />
    );
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "카페 외부 전경" } });
    expect(onCaptionChange).toHaveBeenCalledTimes(1);
    expect(onCaptionChange).toHaveBeenCalledWith("카페 외부 전경");
  });

  it("maxLength가 500으로 설정됨", () => {
    render(<ImageCaptionInput {...defaultProps} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("maxLength", "500");
  });
});
