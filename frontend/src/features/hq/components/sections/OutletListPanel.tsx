import { Outlet } from "../../../../lib/api/types";
import { ListSkeleton } from "../../../../shared/ui/Loading";
import { Panel } from "../../../../shared/ui/Panel";

interface OutletListPanelProps {
  outlets: Outlet[];
  isLoading: boolean;
}

export function OutletListPanel({ outlets, isLoading }: OutletListPanelProps) {
  return (
    <Panel title="Outlets" className="xl:col-span-1">
      <div className="mb-3 flex items-center justify-between">
        <span className="metric-pill">{outlets.length} total outlets</span>
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : (
        <div className="space-y-2">
          {outlets.map((outlet) => (
            <div key={outlet.id} className="list-row">
              <span className="font-semibold text-ink">{outlet.code}</span>
              <span>{outlet.name}</span>
              <span className="text-moss/70">{outlet.location}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
