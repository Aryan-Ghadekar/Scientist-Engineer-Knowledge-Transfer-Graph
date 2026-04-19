import React from "react";
import { AlertTriangle, WifiOff } from "lucide-react";

interface Props {
  type: "error" | "empty";
  message?: string;
  onRetry?: () => void;
}

const TableState: React.FC<Props> = ({ type, message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {type === "error" ? (
        <WifiOff className="w-10 h-10 text-red-400 opacity-70" />
      ) : (
        <AlertTriangle className="w-10 h-10 text-gray-400 opacity-70" />
      )}

      <p className="text-sm text-gray-400 font-mono max-w-sm">
        {message || (type === "error"
          ? "Network issue — unable to fetch data"
          : "No data available")}
      </p>

      {type === "error" && onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-xs border border-red-400/30 text-red-400 rounded-md hover:bg-red-400/10"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default TableState;