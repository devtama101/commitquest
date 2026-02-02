"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type BadgeType = "default" | "commits" | "streak" | "level" | "achievements";
type BadgeStyle = "flat" | "rounded" | "rounded-full" | "pop";
type BadgeColor = "default" | "dark" | "light";

interface BadgeEmbedProps {
  username: string;
}

export function BadgeEmbed({ username }: BadgeEmbedProps) {
  const [badgeType, setBadgeType] = useState<BadgeType>("default");
  const [badgeStyle, setBadgeStyle] = useState<BadgeStyle>("rounded");
  const [badgeColor, setBadgeColor] = useState<BadgeColor>("default");
  const [copied, setCopied] = useState(false);

  const badgeUrl = `${window.location.origin}/badge/${username}.svg?type=${badgeType}&style=${badgeStyle}&color=${badgeColor}`;

  const markdownCode = `
![CommitQuest Badge](${badgeUrl})
`.trim();

  const htmlCode = `
<a href="${window.location.origin}">
  <img src="${badgeUrl}" alt="CommitQuest Badge" />
</a>
`.trim();

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6">
      <h3 className="font-display text-xl text-dark mb-4">🏅 GitHub README Badge</h3>
      <p className="font-body text-sm text-gray-600 mb-6">
        Show off your coding achievements on your GitHub profile README!
      </p>

      {/* Badge Preview */}
      <div className="bg-sand/50 p-6 rounded-xl mb-6 flex items-center justify-center">
        <img
          src={badgeUrl}
          alt="CommitQuest Badge Preview"
          className="max-w-full"
        />
      </div>

      {/* Controls */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="font-body text-sm font-bold text-dark mb-2 block">Badge Type</label>
          <div className="flex flex-wrap gap-2">
            {(["default", "commits", "streak", "level", "achievements"] as BadgeType[]).map((type) => (
              <button
                key={type}
                onClick={() => setBadgeType(type)}
                className={`px-3 py-2 rounded-lg font-body text-sm font-bold border-2 border-dark transition-all ${
                  badgeType === type
                    ? "bg-orange text-white"
                    : "bg-white text-dark hover:bg-sand"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-body text-sm font-bold text-dark mb-2 block">Style</label>
          <div className="flex flex-wrap gap-2">
            {(["flat", "rounded", "rounded-full", "pop"] as BadgeStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setBadgeStyle(style)}
                className={`px-3 py-2 rounded-lg font-body text-sm font-bold border-2 border-dark transition-all ${
                  badgeStyle === style
                    ? "bg-teal text-white"
                    : "bg-white text-dark hover:bg-sand"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-body text-sm font-bold text-dark mb-2 block">Color Theme</label>
          <div className="flex flex-wrap gap-2">
            {(["default", "dark", "light"] as BadgeColor[]).map((color) => (
              <button
                key={color}
                onClick={() => setBadgeColor(color)}
                className={`px-3 py-2 rounded-lg font-body text-sm font-bold border-2 border-dark transition-all ${
                  badgeColor === color
                    ? "bg-dark text-white"
                    : "bg-white text-dark hover:bg-sand"
                }`}
              >
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Embed Codes */}
      <div className="space-y-4">
        <div>
          <label className="font-body text-sm font-bold text-dark mb-2 block">Markdown (GitHub README)</label>
          <div className="relative">
            <pre className="bg-dark text-white p-3 rounded-lg text-xs overflow-x-auto">
              <code>{markdownCode}</code>
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={() => handleCopy(markdownCode)}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        <div>
          <label className="font-body text-sm font-bold text-dark mb-2 block">HTML</label>
          <div className="relative">
            <pre className="bg-dark text-white p-3 rounded-lg text-xs overflow-x-auto">
              <code>{htmlCode}</code>
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={() => handleCopy(htmlCode)}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        <div>
          <label className="font-body text-sm font-bold text-dark mb-2 block">Direct URL</label>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={badgeUrl}
              className="w-full bg-sand border-2 border-dark rounded-lg p-3 text-sm font-mono"
            />
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={() => handleCopy(badgeUrl)}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
