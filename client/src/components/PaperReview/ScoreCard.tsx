import React from "react";

interface Props {
  label: string;
  value: number;
}

const ScoreCard: React.FC<Props> = ({
  label,
  value,
}) => {
  return (
    <div className="bg-surface-container-high p-5 rounded-2xl ghost-border">
      <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">
        {label}
      </p>

      <div className="text-3xl font-bold text-primary">
        {value}
      </div>

      <p className="text-xs text-on-surface-variant">
        /10
      </p>
    </div>
  );
};

export default ScoreCard;