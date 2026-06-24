import { LucideIcon } from "lucide-react";

interface BadgeProps {
  icon: LucideIcon;
  title: string;
  description: string;
  earned?: boolean;
  progress?: number;
}

export default function Badge({ icon: Icon, title, description, earned = false, progress }: BadgeProps) {
  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all ${
        earned
          ? "bg-gradient-to-br from-primary to-secondary border-transparent shadow-md"
          : "bg-card border-border opacity-60"
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
            earned ? "bg-white/20" : "bg-muted"
          }`}
        >
          <Icon className={`w-8 h-8 ${earned ? "text-white" : "text-muted-foreground"}`} />
        </div>
        <h4 className={`font-semibold mb-1 ${earned ? "text-white" : "text-foreground"}`}>
          {title}
        </h4>
        <p className={`text-xs ${earned ? "text-white/80" : "text-muted-foreground"}`}>
          {description}
        </p>
        {!earned && progress !== undefined && (
          <div className="w-full mt-3">
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
}
