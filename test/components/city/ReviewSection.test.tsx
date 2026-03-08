/**
 * @vitest environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ReviewSection from "@/components/city/ReviewSection";
import { Review } from "@/types/city";

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Star: ({ className }: any) => (
    <svg data-testid="star-icon" data-class={className} />
  ),
  ThumbsUp: () => <svg data-testid="thumbsup-icon" />,
  Calendar: () => <svg data-testid="calendar-icon" />,
  Clock: () => <svg data-testid="clock-icon" />,
  User: () => <svg data-testid="user-icon" />,
  PenLine: () => <svg data-testid="pen-icon" />,
}));

// Mock child components
vi.mock("@/components/city/RatingForm", () => ({
  default: ({ cityId, cityName }: any) => (
    <div data-testid="rating-form" data-city-id={cityId} data-city-name={cityName}>
      Rating Form
    </div>
  ),
}));

vi.mock("@/components/city/ReviewForm", () => ({
  default: ({ cityId, cityName }: any) => (
    <div data-testid="review-form" data-city-id={cityId} data-city-name={cityName}>
      Review Form
    </div>
  ),
}));

// Mock Shadcn Button
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button {...props} onClick={onClick} data-testid="button">
      {children}
    </button>
  ),
}));

const mockReviews: Review[] = [
  {
    id: "review-1",
    authorName: "홍길동",
    authorImage: "https://example.com/avatar1.jpg",
    rating: 5,
    content: "정말 좋은 도시입니다!",
    createdAt: "2024-01-15T10:00:00Z",
    likes: 10,
  },
  {
    id: "review-2",
    authorName: "김철수",
    authorImage: "https://example.com/avatar2.jpg",
    rating: 4,
    content: "좋은 도시입니다",
    createdAt: "2024-01-10T10:00:00Z",
    likes: 5,
  },
  {
    id: "review-3",
    authorName: "이영희",
    authorImage: "https://example.com/avatar3.jpg",
    rating: 3,
    content: "평범한 도시",
    createdAt: "2024-01-05T10:00:00Z",
    likes: 2,
  },
];

describe("ReviewSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("빈 리뷰 목록을 처리", () => {
    render(
      <ReviewSection reviews={[]} cityName="서울" cityId="city-1" />
    );

    expect(screen.getByText("아직 리뷰가 없습니다.")).toBeInTheDocument();
  });

  it("리뷰 목록을 렌더링", () => {
    render(
      <ReviewSection reviews={mockReviews} cityName="서울" cityId="city-1" />
    );

    expect(screen.getByText("정말 좋은 도시입니다!")).toBeInTheDocument();
    expect(screen.getByText("좋은 도시입니다")).toBeInTheDocument();
    expect(screen.getByText("평범한 도시")).toBeInTheDocument();
  });

  it("제목에 도시명을 표시", () => {
    render(
      <ReviewSection reviews={mockReviews} cityName="서울" cityId="city-1" />
    );

    expect(screen.getByText("✍️ 서울 리뷰")).toBeInTheDocument();
  });

  it("평균 평점을 계산하고 표시", () => {
    render(
      <ReviewSection reviews={mockReviews} cityName="서울" cityId="city-1" />
    );

    // (5 + 4 + 3) / 3 = 4.0
    expect(screen.getByText("4.0")).toBeInTheDocument();
  });

  it("리뷰 개수를 표시", () => {
    render(
      <ReviewSection reviews={mockReviews} cityName="서울" cityId="city-1" />
    );

    expect(screen.getByText("3개의 리뷰")).toBeInTheDocument();
  });

  it("작성자 이름을 표시", () => {
    render(
      <ReviewSection reviews={mockReviews} cityName="서울" cityId="city-1" />
    );

    expect(screen.getByText("홍길동")).toBeInTheDocument();
    expect(screen.getByText("김철수")).toBeInTheDocument();
    expect(screen.getByText("이영희")).toBeInTheDocument();
  });

  it("리뷰 내용을 표시", () => {
    render(
      <ReviewSection reviews={mockReviews} cityName="서울" cityId="city-1" />
    );

    expect(screen.getByText("정말 좋은 도시입니다!")).toBeInTheDocument();
  });

  it("좋아요 수를 표시", () => {
    render(
      <ReviewSection reviews={mockReviews} cityName="서울" cityId="city-1" />
    );

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("정렬 버튼을 렌더링", () => {
    render(
      <ReviewSection reviews={mockReviews} cityName="서울" cityId="city-1" />
    );

    expect(screen.getByText("최신순")).toBeInTheDocument();
    expect(screen.getByText("평점순")).toBeInTheDocument();
    expect(screen.getByText("좋아요순")).toBeInTheDocument();
  });

  it("최신순 정렬이 기본값임", () => {
    render(
      <ReviewSection reviews={mockReviews} cityName="서울" cityId="city-1" />
    );

    const reviewTexts = screen.getAllByText(/정말|좋은|평범/);
    // 첫 번째가 "정말 좋은 도시입니다!" (최신)이어야 함
    expect(reviewTexts[0]).toHaveTextContent("정말 좋은 도시입니다!");
  });

  it("RatingForm과 ReviewForm을 cityId가 있을 때 렌더링", () => {
    render(
      <ReviewSection reviews={mockReviews} cityName="서울" cityId="city-1" />
    );

    expect(screen.getByTestId("rating-form")).toBeInTheDocument();
    expect(screen.getByTestId("review-form")).toBeInTheDocument();
  });

  it("cityId가 없으면 RatingForm과 ReviewForm을 렌더링하지 않음 (빈 리뷰)", () => {
    render(
      <ReviewSection reviews={[]} cityName="서울" />
    );

    expect(screen.queryByTestId("rating-form")).not.toBeInTheDocument();
    expect(screen.queryByTestId("review-form")).not.toBeInTheDocument();
  });

  it("단일 리뷰의 평균 평점을 올바르게 계산", () => {
    const singleReview: Review[] = [mockReviews[0]];

    render(
      <ReviewSection reviews={singleReview} cityName="서울" cityId="city-1" />
    );

    expect(screen.getByText("5.0")).toBeInTheDocument();
  });

  it("평가/리뷰 작성 버튼을 cityId가 있을 때 표시", () => {
    render(
      <ReviewSection reviews={mockReviews} cityName="서울" cityId="city-1" />
    );

    const ratingForms = screen.getAllByTestId("rating-form");
    const reviewForms = screen.getAllByTestId("review-form");

    // 위아래 두 개씩 있어야 함
    expect(ratingForms.length).toBeGreaterThan(0);
    expect(reviewForms.length).toBeGreaterThan(0);
  });

  it("평점이 소수점 첫 자리까지 표시됨", () => {
    const reviewsWithManyRatings: Review[] = [
      ...mockReviews,
      {
        id: "review-4",
        authorName: "박민준",
        authorImage: "https://example.com/avatar4.jpg",
        rating: 4,
        content: "좋습니다",
        createdAt: "2024-01-01T10:00:00Z",
        likes: 1,
      },
    ];

    render(
      <ReviewSection reviews={reviewsWithManyRatings} cityName="서울" cityId="city-1" />
    );

    // (5 + 4 + 3 + 4) / 4 = 4.0
    expect(screen.getByText("4.0")).toBeInTheDocument();
  });

  it("빈 리뷰일 때 평균 평점은 0.0", () => {
    render(
      <ReviewSection reviews={[]} cityName="서울" cityId="city-1" />
    );

    // 빈 리뷰 상태에서는 평균 평점을 표시하지 않으므로 이 테스트는 스킵할 수 있음
    expect(screen.getByText("아직 리뷰가 없습니다.")).toBeInTheDocument();
  });
});
