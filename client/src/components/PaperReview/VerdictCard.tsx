import React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  verdict: string;
  score: number;
  confidence: string;
}

const VerdictCard: React.FC<Props> = ({
  verdict,
  score,
  confidence,
}) => {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
      <div className="flex justify-between">

        <div className="flex gap-4">

          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            <AlertTriangle className="text-primary" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-primary">
              Verdict
            </p>

            <h3 className="text-xl font-bold">
              {verdict}
            </h3>

            <p className="text-sm text-on-surface-variant">
              Confidence: {confidence}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold text-primary">
            {score}
          </div>

          <div className="text-xs">
            Overall Score
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerdictCard;