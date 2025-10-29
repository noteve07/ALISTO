import React from 'react'
import { RISK_LEVELS } from '../utils/riskUtils'

const RiskLegend = () => {
  const levels = ['high', 'medium', 'low']

  return (
    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 px-4 py-3 space-y-2 text-sm text-slate-700">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Risk Levels</p>
      {levels.map((level) => (
        <div key={level} className="flex items-center gap-3">
          <span
            className="inline-block h-3 w-8 rounded-full border border-slate-300"
            style={{ backgroundColor: RISK_LEVELS[level].color }}
            aria-hidden="true"
          />
          <span className="text-sm font-medium capitalize">{RISK_LEVELS[level].label}</span>
        </div>
      ))}
      <div className="flex items-center gap-3 pt-1 border-t border-slate-200">
        <span
          className="inline-block h-3 w-8 rounded-full border border-dashed border-slate-300"
          style={{ backgroundColor: RISK_LEVELS.unknown.color }}
          aria-hidden="true"
        />
        <span className="text-xs uppercase tracking-wide text-slate-500">No data</span>
      </div>
    </div>
  )
}

export default RiskLegend


