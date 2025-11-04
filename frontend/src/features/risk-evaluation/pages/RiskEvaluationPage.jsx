import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import RiskMap from "../components/RiskMap";
import { useRiskEvaluations } from "../hooks/useRiskEvaluations";

const SummaryCard = ({ label, value, accent }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className={`mt-2 text-2xl font-semibold ${accent}`}>{value}</p>
  </div>
);

const RiskEvaluationPage = () => {
  const { riskByProvince, riskSummary, loading, error } = useRiskEvaluations();
  const location = useLocation();
  const [initialMapState, setInitialMapState] = useState(null);

  // Check if navigation state has center and zoom
  useEffect(() => {
    if (location.state?.center && location.state?.zoom) {
      setInitialMapState({
        center: location.state.center,
        zoom: location.state.zoom,
      });
    }
  }, [location]);

  return (
    <div className="flex h-full flex-col gap-5">
      {/* <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Provincial Risk Evaluation</h1>
          <p className="text-sm text-slate-500">Visualize current dynamic risk levels across Philippine provinces.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Total Provinces" value={riskSummary.total} accent="text-slate-900" />
          <SummaryCard label="High Risk" value={riskSummary.high} accent="text-rose-500" />
          <SummaryCard label="Medium Risk" value={riskSummary.medium} accent="text-amber-500" />
          <SummaryCard label="Low Risk" value={riskSummary.low} accent="text-emerald-500" />
        </div>
      </div> */}

      <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {error && !loading && (
          <div className="absolute inset-4 z-10 rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-rose-700 shadow-inner">
            <p className="text-sm font-semibold">
              Failed to load risk evaluations.
            </p>
            <p className="text-xs text-rose-500">Please try again later.</p>
          </div>
        )}

        <RiskMap
          riskByProvince={riskByProvince}
          initialMapState={initialMapState}
        />
      </div>
    </div>
  );
};

export default RiskEvaluationPage;
