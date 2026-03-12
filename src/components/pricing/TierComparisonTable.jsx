import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function TierComparisonTable({ data }) {
  if (!data || !data.tiers || data.tiers.length === 0) {
    return <p className="text-white text-center">No comparison data available.</p>;
  }

  const allFeatures = Array.from(new Set(data.tiers.flatMap(tier => Object.keys(tier.features))));

  const formatFeatureName = (feature) => {
    return feature
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="overflow-x-auto">
      <h2 className="text-white text-xl md:text-2xl font-bold text-center mb-6">{data.title}</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-700">
            <th className="p-3 border-b border-slate-600 text-slate-200 text-sm md:text-base">Features</th>
            {data.tiers.map((tier) => (
              <th key={tier.name} className="p-3 border-b border-slate-600 text-white font-semibold text-center text-sm md:text-base">
                <div className="flex flex-col items-center gap-1">
                  {tier.badge && (
                    <span className="text-[10px] bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded-full font-medium">
                      {tier.badge}
                    </span>
                  )}
                  <div>{tier.label}</div>
                  <p className="text-slate-400 text-xs font-normal">{tier.best_for}</p>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((feature) => (
            <tr key={feature} className="border-b border-slate-700 last:border-b-0 hover:bg-slate-800/50">
              <td className="p-3 text-slate-300 text-sm md:text-base">
                {formatFeatureName(feature)}
              </td>
              {data.tiers.map((tier) => (
                <td key={tier.name + feature} className="p-3 text-center">
                  {tier.features[feature] ? (
                    <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}