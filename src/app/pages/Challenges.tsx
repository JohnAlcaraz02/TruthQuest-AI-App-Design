import Sidebar from "../components/Sidebar";
import { Trophy, Clock, Award, Target, Flame } from "lucide-react";

export default function Challenges() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Challenges</h1>
        <p className="text-muted-foreground mb-8">Complete challenges to earn bonus XP</p>
        <div className="bg-card rounded-xl p-12 border border-border text-center">
          <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground">Challenges Coming Soon</h3>
        </div>
      </div>
    </div>
  );
}
