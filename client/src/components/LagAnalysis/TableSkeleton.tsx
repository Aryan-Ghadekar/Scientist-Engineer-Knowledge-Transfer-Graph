import React from "react";

interface Props {
  rows?: number;
}

const TableSkeleton: React.FC<Props> = ({ rows = 10 }) => {
  return (
    <tbody>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-white/5">
          {/* Discovery */}
          <td className="px-8 py-6">
            <div className="h-4 w-48 bg-white/10 rounded" />
          </td>

          {/* Year */}
          <td className="px-8 py-6 text-center">
            <div className="h-4 w-10 mx-auto bg-white/10 rounded" />
          </td>

          {/* Implementation */}
          <td className="px-8 py-6">
            <div className="h-4 w-40 bg-white/10 rounded" />
          </td>

          {/* Year */}
          <td className="px-8 py-6 text-center">
            <div className="h-4 w-10 mx-auto bg-white/10 rounded" />
          </td>

          {/* Lag */}
          <td className="px-8 py-6 text-right">
            <div className="h-6 w-16 ml-auto bg-white/10 rounded-full" />
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default TableSkeleton;