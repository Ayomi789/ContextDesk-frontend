/**
 * Page-matched loading skeletons. Each one mirrors the layout of its
 * page (same grids, cards, rows) so content pops in without shifting.
 */

function Bone({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`skeleton ${className}`} />
  );
}

function PageHeader({ button = true }: { button?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <Bone className="h-7 w-40 rounded-lg" />
        <Bone className="h-4 w-24 rounded mt-2" />
      </div>
      {button && <Bone className="h-9 w-32 rounded-lg" />}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard">
      <div>
        <Bone className="h-7 w-44 rounded-lg" />
        <Bone className="h-4 w-64 rounded mt-2" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-bg-card border border-border rounded-xl p-4"
          >
            <Bone className="w-9 h-9 rounded-lg mb-3" />
            <Bone className="h-7 w-12 rounded" />
            <Bone className="h-3 w-16 rounded mt-2" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-bg-card border border-border rounded-xl p-5"
          >
            <Bone className="h-4 w-32 rounded mb-4" />
            <div className="space-y-3.5">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j}>
                  <div className="flex justify-between mb-1.5">
                    <Bone className="h-4 w-20 rounded" />
                    <Bone className="h-4 w-16 rounded" />
                  </div>
                  <Bone className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TicketsSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading tickets">
      <PageHeader />
      <div className="flex flex-wrap gap-2">
        <Bone className="h-9 flex-1 min-w-[200px] rounded-lg" />
        <Bone className="h-9 w-28 rounded-lg" />
        <Bone className="h-9 w-28 rounded-lg" />
        <Bone className="h-9 w-32 rounded-lg" />
      </div>
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="flex gap-4 px-4 py-3 border-b border-border">
              {['w-10', 'w-40', 'w-20', 'w-20', 'w-24', 'w-24', 'w-20'].map(
                (w, i) => (
                  <Bone key={i} className={`h-3 ${w} rounded`} />
                )
              )}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0"
              >
                <Bone className="h-4 w-10 rounded" />
                <Bone className="h-4 w-40 rounded" />
                <Bone className="h-5 w-20 rounded-full" />
                <Bone className="h-5 w-20 rounded-full" />
                <Bone className="h-4 w-24 rounded" />
                <Bone className="h-4 w-24 rounded" />
                <Bone className="h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TicketDetailSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading ticket">
      <Bone className="h-4 w-28 rounded" />
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0 space-y-4">
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <Bone className="h-5 w-2/3 rounded" />
            <div className="flex flex-wrap gap-2 mt-3">
              <Bone className="h-5 w-16 rounded-full" />
              <Bone className="h-5 w-20 rounded-full" />
              <Bone className="h-5 w-24 rounded-full" />
            </div>
          </div>
          <div className="bg-bg-card border border-border rounded-xl">
            <div className="p-4 border-b border-border">
              <Bone className="h-4 w-28 rounded" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border-b border-border last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <Bone className="w-7 h-7 rounded-full" />
                  <Bone className="h-4 w-24 rounded" />
                  <Bone className="h-3 w-16 rounded ml-auto" />
                </div>
                <div className="pl-9 space-y-2">
                  <Bone className="h-3.5 w-full rounded" />
                  <Bone className="h-3.5 w-4/5 rounded" />
                </div>
              </div>
            ))}
            <div className="p-4 border-t border-border">
              <Bone className="h-20 w-full rounded-lg" />
            </div>
          </div>
        </div>
        <div className="w-full lg:w-80 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-bg-card border border-border rounded-xl p-4"
            >
              <Bone className="h-3 w-24 rounded mb-3" />
              <Bone className="h-4 w-3/4 rounded mb-2" />
              <Bone className="h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CardsGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
      aria-label="Loading"
    >
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="bg-bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <Bone className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Bone className="h-4 w-2/3 rounded mb-2" />
              <Bone className="h-3 w-1/2 rounded" />
            </div>
          </div>
          <Bone className="h-3 w-full rounded mb-2" />
          <Bone className="h-3 w-4/5 rounded" />
        </div>
      ))}
    </div>
  );
}

export function TeamSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading team">
      <div>
        <Bone className="h-7 w-32 rounded-lg" />
        <Bone className="h-4 w-56 rounded mt-2" />
      </div>
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <Bone className="h-4 w-40 rounded mb-4" />
        <div className="flex flex-col sm:flex-row gap-2">
          <Bone className="h-9 flex-1 rounded-lg" />
          <Bone className="h-9 w-28 rounded-lg" />
          <Bone className="h-9 w-28 rounded-lg" />
        </div>
      </div>
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <Bone className="h-4 w-32 rounded mb-3" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="py-2.5 flex items-center gap-3">
            <Bone className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <Bone className="h-4 w-40 rounded mb-1.5" />
              <Bone className="h-3 w-52 rounded" />
            </div>
            <Bone className="h-7 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
