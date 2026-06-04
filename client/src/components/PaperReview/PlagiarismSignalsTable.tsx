import React from "react";

interface Signal {
  type: string;
  severity: string;
  location: string;
  excerpt: string;
  explanation: string;
}

const PlagiarismSignalsTable = ({
  signals,
}: {
  signals: Signal[];
}) => {
  return (
    <div className="bg-surface-container rounded-2xl overflow-hidden ghost-border">

      <div className="p-6 border-b border-white/10">
        <h3 className="font-bold text-xl">
          Suspicious Signals
        </h3>
      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>
            <tr className="bg-surface-container-low">
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4">Severity</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Excerpt</th>
            </tr>
          </thead>

          <tbody>

            {signals.map((s, i) => (
              <tr
                key={i}
                className="border-t border-white/5"
              >
                <td className="px-6 py-4">
                  {s.type}
                </td>

                <td className="px-6 py-4">
                  {s.severity}
                </td>

                <td className="px-6 py-4">
                  {s.location}
                </td>

                <td className="px-6 py-4 text-sm text-on-surface-variant">
                  {s.excerpt}
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>
    </div>
  );
};

export default PlagiarismSignalsTable;