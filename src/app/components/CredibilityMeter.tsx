import { motion } from "motion/react";

interface CredibilityMeterProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function CredibilityMeter({
  score,
  size = "md",
  showLabel = true,
}: CredibilityMeterProps) {
  const getColor = (score: number) => {
    if (score >= 80) return { from: "#22C55E", to: "#14B8A6", label: "Highly Credible" };
    if (score >= 60) return { from: "#14B8A6", to: "#F59E0B", label: "Moderately Credible" };
    if (score >= 40) return { from: "#F59E0B", to: "#F97316", label: "Low Credibility" };
    return { from: "#EF4444", to: "#DC2626", label: "Not Credible" };
  };

  const colors = getColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const sizes = {
    sm: { width: 80, fontSize: "text-xl", strokeWidth: 6 },
    md: { width: 120, fontSize: "text-3xl", strokeWidth: 8 },
    lg: { width: 160, fontSize: "text-4xl", strokeWidth: 10 },
  };

  const { width, fontSize, strokeWidth } = sizes[size];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        <svg className="transform -rotate-90" width={width} height={width}>
          <defs>
            <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
          </defs>
          <circle
            cx={width / 2}
            cy={width / 2}
            r={45}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <motion.circle
            cx={width / 2}
            cy={width / 2}
            r={45}
            stroke={`url(#gradient-${score})`}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeDasharray={circumference}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={`${fontSize} font-bold`}
            style={{ color: colors.from }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      {showLabel && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-sm font-medium text-muted-foreground mt-3"
        >
          {colors.label}
        </motion.p>
      )}
    </div>
  );
}
