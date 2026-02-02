"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ProfileSettingsData {
  bio: string | null;
  location: string | null;
  website: string | null;
  showActivity: boolean;
  showStats: boolean;
  showAchievements: boolean;
  customTheme: string | null;
}

interface ProfileSettingsProps {
  username: string;
}

export function ProfileSettings({ username }: ProfileSettingsProps) {
  const [settings, setSettings] = useState<ProfileSettingsData>({
    bio: "",
    location: "",
    website: "",
    showActivity: true,
    showStats: true,
    showAchievements: true,
    customTheme: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/profile/settings");
        const data = await res.json();
        setSettings(data.profile);
      } catch (error) {
        console.error("Failed to fetch profile settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/profile/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save profile settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof ProfileSettingsData, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-sand rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-sand rounded w-full"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl text-dark">👤 Profile Settings</h3>
        {saved && (
          <span className="font-body text-sm text-green-600 font-bold">Saved!</span>
        )}
      </div>

      <div className="space-y-6">
        {/* Bio */}
        <div>
          <label className="font-body text-sm font-bold text-dark mb-2 block">Bio</label>
          <textarea
            value={settings.bio || ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Tell us about yourself..."
            className="w-full bg-white border-2 border-dark rounded-lg p-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-orange"
            rows={3}
          />
        </div>

        {/* Location */}
        <div>
          <label className="font-body text-sm font-bold text-dark mb-2 block">Location</label>
          <input
            type="text"
            value={settings.location || ""}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="e.g., San Francisco, CA"
            className="w-full bg-white border-2 border-dark rounded-lg p-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-orange"
          />
        </div>

        {/* Website */}
        <div>
          <label className="font-body text-sm font-bold text-dark mb-2 block">Website</label>
          <input
            type="url"
            value={settings.website || ""}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder="https://yourwebsite.com"
            className="w-full bg-white border-2 border-dark rounded-lg p-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-orange"
          />
        </div>

        {/* Privacy Settings */}
        <div className="border-t-2 border-dark/20 pt-6">
          <h4 className="font-body text-sm font-bold text-dark mb-4">Privacy Settings</h4>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-body text-sm text-dark">Show activity on public profile</span>
              <input
                type="checkbox"
                checked={settings.showActivity}
                onChange={(e) => handleChange("showActivity", e.target.checked)}
                className="w-5 h-5 accent-orange"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-body text-sm text-dark">Show stats on public profile</span>
              <input
                type="checkbox"
                checked={settings.showStats}
                onChange={(e) => handleChange("showStats", e.target.checked)}
                className="w-5 h-5 accent-orange"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-body text-sm text-dark">Show achievements on public profile</span>
              <input
                type="checkbox"
                checked={settings.showAchievements}
                onChange={(e) => handleChange("showAchievements", e.target.checked)}
                className="w-5 h-5 accent-orange"
              />
            </label>
          </div>
        </div>

        {/* Public Profile Link */}
        <div className="bg-sand/50 p-4 rounded-lg">
          <div className="font-body text-sm text-gray-600 mb-2">Your public profile:</div>
          <a
            href={`/u/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm text-teal hover:underline break-all"
          >
            {typeof window !== "undefined" ? window.location.origin : ""}/u/{username}
          </a>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
