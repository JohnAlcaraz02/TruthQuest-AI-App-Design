import Sidebar from "../components/Sidebar";
import { Bell, Lock, User, Globe, Palette } from "lucide-react";

export default function Settings() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your account and preferences</p>
        
        <div className="max-w-3xl space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Account</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                <input
                  type="text"
                  defaultValue="Alex Rodriguez"
                  className="w-full px-4 py-2 bg-input-background border border-input rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="alex@example.com"
                  className="w-full px-4 py-2 bg-input-background border border-input rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-foreground">Daily reminders</span>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-foreground">Achievement alerts</span>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
