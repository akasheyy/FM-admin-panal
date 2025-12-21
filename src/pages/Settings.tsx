import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account preferences
          </p>
        </div>

        {/* Profile Section */}
        <div className="animate-fade-in rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-card-foreground sm:text-lg">
            Profile Information
          </h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  First Name
                </label>
                <Input defaultValue="John" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Last Name
                </label>
                <Input defaultValue="Doe" className="h-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input type="email" defaultValue="admin@example.com" className="h-10" />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="animate-fade-in rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-card-foreground sm:text-lg">
            Notifications
          </h2>
          <div className="space-y-4">
            {[
              { label: "Email notifications", description: "Receive email updates", defaultChecked: true },
              { label: "Push notifications", description: "Receive push alerts", defaultChecked: true },
              { label: "Weekly digest", description: "Get a weekly summary", defaultChecked: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Switch defaultChecked={item.defaultChecked} />
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end animate-fade-in">
          <Button onClick={handleSave} className="w-full sm:w-auto">
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
