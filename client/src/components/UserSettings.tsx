import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const UserSettings = () => {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveProfile = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    }, 1000);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Profile Settings</h2>
              <p className="text-sm text-gray-500">
                Manage your account settings and preferences.
              </p>
            </div>

            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company Name (Optional)</Label>
                <Input id="company" placeholder="Your company name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry (Optional)</Label>
                <Input id="industry" placeholder="Your industry" />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">
                Notification Preferences
              </h2>
              <p className="text-sm text-gray-500">
                Choose how and when you want to be notified.
              </p>
            </div>

            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-500">
                    Receive email notifications when your catalogue is
                    generated.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Processing Updates</h3>
                  <p className="text-sm text-gray-500">
                    Get notified about processing status changes.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">New Features</h3>
                  <p className="text-sm text-gray-500">
                    Be the first to know about new features and updates.
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Marketing Communications</h3>
                  <p className="text-sm text-gray-500">
                    Receive promotional offers and marketing emails.
                  </p>
                </div>
                <Switch />
              </div>
            </div>

            <div className="flex justify-end">
              <Button>Save Preferences</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserSettings;
