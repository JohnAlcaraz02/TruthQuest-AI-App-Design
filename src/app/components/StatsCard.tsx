import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  color?: "primary" | "secondary" | "accent" | "success";
  delay?: number;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  color = "primary",
  delay = 0,
}: StatsCardProps) {
  const colorClasses = {
    primary: "bg-blue-50 text-primary",
    secondary: "bg-teal-50 text-secondary",
    accent: "bg-amber-50 text-accent",
    success: "bg-green-50 text-success",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-semibold text-foreground mb-1">{value}</p>
          {change && (
            <p className="text-xs text-success font-medium">{change}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}
