import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Bell, Mail, MessageSquare, Phone, Globe, Shield } from "lucide-react";

export default function AdminNotifications() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState("realtime");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-10">
      <div className="container mx-auto p-2 sm:p-4">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li>
              <button
                className="hover:underline text-green-800 font-medium"
                onClick={() => navigate('/admin')}
              >
                Admin Panel
              </button>
            </li>
            <li>
              <span className="mx-1">/</span>
            </li>
            <li className="text-gray-600">Alerts & Notifications</li>
          </ol>
        </nav>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Alerts & Notifications</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Configure notification preferences and alert settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Email Notifications */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Enable Email Notifications</h3>
                  <p className="text-sm text-gray-500">Send notifications via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Notification Frequency</label>
                <Select value={notificationFrequency} onValueChange={setNotificationFrequency}>
                  <SelectTrigger className="max-w-[200px]">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* SMS Notifications */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">SMS Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Enable SMS Notifications</h3>
                  <p className="text-sm text-gray-500">Send notifications via SMS</p>
                </div>
                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">SMS Gateway</label>
                <Input placeholder="Enter SMS gateway URL" className="max-w-[300px]" />
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Bell className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">Push Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Enable Push Notifications</h3>
                  <p className="text-sm text-gray-500">Send notifications to user devices</p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Firebase Configuration</label>
                <Input placeholder="Enter Firebase config" className="max-w-[300px]" />
              </div>
            </CardContent>
          </Card>

          {/* Notification Templates */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="bg-orange-100 p-3 rounded-xl">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">Notification Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-900">Welcome Email Template</label>
                  <Input placeholder="Enter welcome email template" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900">Alert Template</label>
                  <Input placeholder="Enter alert template" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900">Report Template</label>
                  <Input placeholder="Enter report template" className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-8 max-w-7xl mx-auto">
          <Button variant="outline">Reset to Default</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
} 