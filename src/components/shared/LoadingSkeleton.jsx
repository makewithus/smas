export default function LoadingSkeleton({ rows = 5, variant = 'table' }) {
  if (variant === 'card') {
    return (
      <div className="bg-white border border-[#E8DFD4] rounded-md p-5 animate-pulse">
        <div className="w-9 h-9 bg-neutral-200 rounded-lg mb-3" />
        <div className="h-8 bg-neutral-200 rounded w-24 mb-2" />
        <div className="h-4 bg-neutral-200 rounded w-32" />
      </div>
    )
  }
  
  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-neutral-200 rounded-full shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-neutral-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  // Table variant (default)
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, idx) => (
        <div 
          key={idx} 
          className="h-[52px] flex items-center gap-4 px-4 border-b border-[#E8DFD4] animate-pulse"
        >
          <div className="w-5 h-5 bg-neutral-200 rounded shrink-0" />
          <div className="w-24 h-4 bg-neutral-200 rounded shrink-0" />
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-neutral-200 rounded-full shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-neutral-200 rounded w-32 mb-1" />
              <div className="h-3 bg-neutral-200 rounded w-20" />
            </div>
          </div>
          <div className="w-24 h-4 bg-neutral-200 rounded shrink-0" />
          <div className="w-20 h-4 bg-neutral-200 rounded shrink-0" />
          <div className="w-16 h-6 bg-neutral-200 rounded shrink-0" />
          <div className="w-20 h-4 bg-neutral-200 rounded shrink-0" />
          <div className="w-16 h-4 bg-neutral-200 rounded shrink-0" />
        </div>
      ))}
    </div>
  )
}
