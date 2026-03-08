import { Workspace } from "@/types/city";
import { getWorkspacesByCityId } from "@/lib/mock-data";
import { Coffee, Building2, Wifi, Plug, Star, MapPin, Clock } from "lucide-react";

interface WorkspacesSectionProps {
  cityId: string;
  cityName: string;
}

/**
 * 작업공간 섹션 컴포넌트
 * 카페 및 코워킹 스페이스 목록을 표시
 */
export default function WorkspacesSection({ cityId, cityName }: WorkspacesSectionProps) {
  const workspaces = getWorkspacesByCityId(cityId);

  if (workspaces.length === 0) {
    return (
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">☕ {cityName} 작업공간</h2>
        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
          <Coffee className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>작업공간 정보가 준비 중입니다.</p>
          <p className="text-sm mt-2">곧 카페 및 코워킹 스페이스 정보가 추가될 예정입니다.</p>
        </div>
      </section>
    );
  }

  const cafes = workspaces.filter((ws) => ws.type === "cafe");
  const coworkings = workspaces.filter((ws) => ws.type === "coworking");

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-2">☕ {cityName} 작업공간</h2>
      <p className="text-muted-foreground mb-6">
        노마드들이 추천하는 카페 및 코워킹 스페이스
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 카페 섹션 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Coffee className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold">카페 ({cafes.length})</h3>
          </div>
          <div className="space-y-3">
            {cafes.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
            {cafes.length === 0 && (
              <p className="text-muted-foreground text-sm">등록된 카페가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 코워킹 스페이스 섹션 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">코워킹 스페이스 ({coworkings.length})</h3>
          </div>
          <div className="space-y-3">
            {coworkings.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
            {coworkings.length === 0 && (
              <p className="text-muted-foreground text-sm">등록된 코워킹 스페이스가 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <p>
          💡 <strong>카카오맵 연동 예정:</strong> 실시간 영업 정보 및 위치 지도가 곧 추가됩니다.
        </p>
      </div>
    </section>
  );
}

/**
 * 작업공간 카드 컴포넌트
 */
function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium">{workspace.name}</h4>
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm font-medium">{workspace.rating}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
        <MapPin className="w-3 h-3" />
        <span>{workspace.address}</span>
        <span className="ml-2 text-xs">({workspace.distance}km)</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {workspace.hasPower && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
            <Plug className="w-3 h-3" />
            콘센트
          </span>
        )}
        {workspace.wifiSpeed && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
            <Wifi className="w-3 h-3" />
            {workspace.wifiSpeed}Mbps
          </span>
        )}
        {workspace.hours && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
            <Clock className="w-3 h-3" />
            {workspace.hours}
          </span>
        )}
      </div>
    </div>
  );
}
