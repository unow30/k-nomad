import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getWorkspaceById } from "@/lib/queries/workspaces";
import { getWorkspaceReviews } from "@/lib/queries/workspace-reviews";
import { getUserFromRequest } from "@/lib/auth-helpers";
import WorkspaceDetailHero from "@/components/workspace/WorkspaceDetailHero";
import WorkspaceReviewSection from "@/components/workspace/WorkspaceReviewSection";
import PageBreadcrumb from "@/components/layout/Breadcrumb";

interface WorkspacePageProps {
  params: Promise<{ workspaceSlug: string }>;
}

/**
 * 작업공간 상세 페이지
 * 작업공간의 상세 정보와 리뷰 목록 표시
 */
export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceSlug } = await params;
  const supabase = await createClient();

  try {
    const [workspace, reviews, requestUser] = await Promise.all([
      getWorkspaceById(supabase, workspaceSlug),
      getWorkspaceReviews(supabase, workspaceSlug, 50),
      getUserFromRequest(),
    ]);

    if (!workspace) {
      notFound();
    }

    const isAdmin = requestUser?.role === 'admin';
    const currentUserId = requestUser?.id;

    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto my-2 px-4 pt-4">
          <PageBreadcrumb
            items={[
              { label: "홈", href: "/" },
              ...(workspace.cityName
                ? [{ label: workspace.cityName, href: `/city/${workspace.cityId}` }]
                : []),
              { label: workspace.name },
            ]}
          />
        </div>
        <WorkspaceDetailHero workspace={workspace} />
        <WorkspaceReviewSection
          reviews={reviews}
          workspaceId={workspace.id}
          workspaceName={workspace.name}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      </main>
    );
  } catch (error) {
    console.error("[WorkspacePage] Error loading workspace:", error);
    notFound();
  }
}

/**
 * 메타데이터 생성
 */
export async function generateMetadata({ params }: WorkspacePageProps): Promise<Metadata> {
  const { workspaceSlug } = await params;
  const supabase = await createClient();

  try {
    const workspace = await getWorkspaceById(supabase, workspaceSlug);

    if (!workspace) {
      return { title: "작업공간을 찾을 수 없습니다" };
    }

    return {
      title: `${workspace.name} - 대한민국 노마드 도시`,
      description: workspace.description || `${workspace.name}의 상세 정보와 리뷰를 확인하세요.`,
      openGraph: {
        title: `${workspace.name} - 대한민국 노마드 도시`,
        description: workspace.description || `${workspace.name}의 상세 정보와 리뷰를 확인하세요.`,
        images: workspace.imageUrl ? [workspace.imageUrl] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${workspace.name} - 대한민국 노마드 도시`,
        description: workspace.description || `${workspace.name}의 상세 정보와 리뷰를 확인하세요.`,
        images: workspace.imageUrl ? [workspace.imageUrl] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return { title: "작업공간 - 대한민국 노마드 도시" };
  }
}
