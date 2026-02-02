"use client";

import { Card } from "@/components/ui/Card";

interface CommitWordCloudProps {
  words: Array<{ word: string; count: number }>;
}

export function CommitWordCloud({ words }: CommitWordCloudProps) {
  if (words.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-display text-xl text-dark mb-4">💬 Top Commit Words</h3>
        <div className="text-center py-8 text-gray-500">
          No commit messages to analyze
        </div>
      </Card>
    );
  }

  const maxCount = Math.max(...words.map((w) => w.count));
  const minCount = Math.min(...words.map((w) => w.count));

  // Calculate font size based on count (12px to 32px)
  const getFontSize = (count: number) => {
    const ratio = (count - minCount) / (maxCount - minCount || 1);
    return 12 + ratio * 20;
  };

  // Get color based on count
  const getColor = (count: number) => {
    const ratio = (count - minCount) / (maxCount - minCount || 1);
    if (ratio > 0.7) return "text-orange";
    if (ratio > 0.4) return "text-teal";
    return "text-dark";
  };

  return (
    <Card className="p-6">
      <h3 className="font-display text-xl text-dark mb-4">💬 Top Commit Words</h3>
      <div className="flex flex-wrap gap-2 justify-center items-center min-h-[150px]">
        {words.map((item) => (
          <span
            key={item.word}
            className={`font-body font-bold ${getColor(item.count)} hover:opacity-70 transition-opacity cursor-default`}
            style={{ fontSize: `${getFontSize(item.count)}px` }}
            title={`${item.count} occurrences`}
          >
            {item.word}
          </span>
        ))}
      </div>
      <div className="mt-4 text-center">
        <span className="font-body text-xs text-gray-500">
          Most common: <strong className="text-dark">{words[0]?.word}</strong> ({words[0]?.count}x)
        </span>
      </div>
    </Card>
  );
}
