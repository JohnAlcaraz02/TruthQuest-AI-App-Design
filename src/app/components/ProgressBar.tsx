import { motion } from "motion/react";

interface ProgressBarProps {
  progress: number;
  color?: "primary" | "secondary" | "accent" | "success";
  height?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  label?: string;
}

export default function ProgressBar({
  progress,
  color = "primary",
  height = "md",
  showPercentage = false,
  label,
}: ProgressBarProps) {
  const colorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
    success: "bg-success",
  };

  const heightClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm text-foreground font-medium">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-muted-foreground font-medium">{progress}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-muted rounded-full overflow-hidden ${heightClasses[height]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${colorClasses[color]} rounded-full`}
        />
      </div>
    </div>
  );
}
