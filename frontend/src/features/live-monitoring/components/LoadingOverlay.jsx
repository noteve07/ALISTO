import React from 'react'

const LoadingOverlay = () => {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/85 backdrop-blur-sm">
      <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-6 py-6 text-center shadow-lg shadow-orange-500/10">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
        <div>
          <p className="text-sm font-semibold text-slate-700">Loading live earthquake data…</p>
          <p className="mt-1 text-xs text-slate-500">Fetching the latest updates from PHIVOLCS feeds</p>
        </div>
      </div>
    </div>
  )
}

export default LoadingOverlay