import { Transportation, TransportType } from "@/types/city";
import { getTransportationsByCityId } from "@/lib/mock-data";
import { Train, Bus, Plane, Clock, Banknote, Info } from "lucide-react";

interface TransportSectionProps {
  cityId: string;
  cityName: string;
}

/**
 * 교통 아이콘 컴포넌트
 */
function TransportIcon({ type }: { type: TransportType }) {
  switch (type) {
    case "ktx":
      return <Train className="w-5 h-5 text-blue-600" />;
    case "bus":
      return <Bus className="w-5 h-5 text-green-600" />;
    case "airplane":
      return <Plane className="w-5 h-5 text-purple-600" />;
    default:
      return null;
  }
}

/**
 * 교통수단 라벨
 */
function getTransportLabel(type: TransportType): string {
  switch (type) {
    case "ktx":
      return "KTX";
    case "bus":
      return "버스";
    case "airplane":
      return "비행기";
    default:
      return "";
  }
}

/**
 * 소요시간 포맷팅
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
}

/**
 * 가격 포맷팅
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR").format(price) + "원";
}

/**
 * 교통 섹션 컴포넌트
 * 주요 도시까지의 교통편 정보를 표시
 */
export default function TransportSection({ cityId, cityName }: TransportSectionProps) {
  const transportations = getTransportationsByCityId(cityId);

  if (transportations.length === 0) {
    return (
      <section className="container mx-auto px-4 py-12 border-t">
        <h2 className="text-2xl font-bold mb-6">🚄 {cityName}에서 이동하기</h2>
        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
          <Train className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>교통 정보가 준비 중입니다.</p>
          <p className="text-sm mt-2">곧 KTX, 버스, 비행기 정보가 추가될 예정입니다.</p>
        </div>
      </section>
    );
  }

  // 교통수단별 그룹화
  const ktxRoutes = transportations.filter((t) => t.type === "ktx");
  const busRoutes = transportations.filter((t) => t.type === "bus");
  const airRoutes = transportations.filter((t) => t.type === "airplane");

  return (
    <section className="container mx-auto px-4 py-12 border-t">
      <h2 className="text-2xl font-bold mb-2">🚄 {cityName}에서 이동하기</h2>
      <p className="text-muted-foreground mb-6">
        주요 도시까지의 교통편 및 소요시간
      </p>

      {/* 교통 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-4 font-medium">목적지</th>
              <th className="text-left py-3 px-4 font-medium">교통수단</th>
              <th className="text-left py-3 px-4 font-medium">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  소요시간
                </div>
              </th>
              <th className="text-left py-3 px-4 font-medium">
                <div className="flex items-center gap-1">
                  <Banknote className="w-4 h-4" />
                  요금
                </div>
              </th>
              <th className="text-left py-3 px-4 font-medium">
                <div className="flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  비고
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {transportations.map((transport, index) => (
              <TransportRow key={`${transport.destination}-${transport.type}-${index}`} transport={transport} />
            ))}
          </tbody>
        </table>
      </div>

      {/* 교통수단 요약 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {ktxRoutes.length > 0 && (
          <TransportSummaryCard
            type="ktx"
            count={ktxRoutes.length}
            fastest={Math.min(...ktxRoutes.map((r) => r.duration))}
          />
        )}
        {busRoutes.length > 0 && (
          <TransportSummaryCard
            type="bus"
            count={busRoutes.length}
            fastest={Math.min(...busRoutes.map((r) => r.duration))}
          />
        )}
        {airRoutes.length > 0 && (
          <TransportSummaryCard
            type="airplane"
            count={airRoutes.length}
            fastest={Math.min(...airRoutes.map((r) => r.duration))}
          />
        )}
      </div>
    </section>
  );
}

/**
 * 교통 테이블 행 컴포넌트
 */
function TransportRow({ transport }: { transport: Transportation }) {
  return (
    <tr className="border-b hover:bg-muted/30 transition-colors">
      <td className="py-3 px-4 font-medium">{transport.destination}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <TransportIcon type={transport.type} />
          <span>{getTransportLabel(transport.type)}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="font-medium text-blue-600">
          {formatDuration(transport.duration)}
        </span>
      </td>
      <td className="py-3 px-4">
        {transport.price ? formatPrice(transport.price) : "-"}
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {transport.note || "-"}
      </td>
    </tr>
  );
}

/**
 * 교통수단 요약 카드 컴포넌트
 */
function TransportSummaryCard({
  type,
  count,
  fastest,
}: {
  type: TransportType;
  count: number;
  fastest: number;
}) {
  const bgColor = {
    ktx: "bg-blue-50 border-blue-200",
    bus: "bg-green-50 border-green-200",
    airplane: "bg-purple-50 border-purple-200",
  }[type];

  return (
    <div className={`p-4 rounded-lg border ${bgColor}`}>
      <div className="flex items-center gap-2 mb-2">
        <TransportIcon type={type} />
        <span className="font-medium">{getTransportLabel(type)}</span>
      </div>
      <div className="text-sm text-muted-foreground">
        <p>{count}개 노선 운행</p>
        <p className="font-medium text-foreground">
          최단 {formatDuration(fastest)}
        </p>
      </div>
    </div>
  );
}
