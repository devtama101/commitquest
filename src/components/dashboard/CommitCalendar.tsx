"use client";

import { useEffect, useState } from "react";

const TIMEZONE = "Asia/Jakarta";

interface CalendarData {
  date: string;
  count: number;
}

export function CommitCalendar() {
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<CalendarData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchCalendar = async (retryCount = 0) => {
      try {
        const res = await fetch("/api/commits/calendar");
        if (!res.ok) {
          if (res.status === 401 && retryCount < 3) {
            setTimeout(() => fetchCalendar(retryCount + 1), 500 * (retryCount + 1));
            return;
          }
          setCalendarData([]);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setCalendarData(data.calendarData ?? []);
      } catch {
        setCalendarData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, []);

  const getLevel = (count: number) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
  };

  const levelColors = [
    "bg-heat-0",
    "bg-heat-1",
    "bg-heat-2",
    "bg-heat-3",
    "bg-heat-4",
  ];

  // Format date nicely in Indonesia timezone
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    const date = new Date(`${year}-${month}-${day}T00:00:00`);
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: TIMEZONE,
    });
  };

  const handleMouseEnter = (day: CalendarData, event: React.MouseEvent) => {
    setHoveredDay(day);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  // Group by week
  const weeks: CalendarData[][] = [];
  for (let i = 0; i < calendarData.length; i += 7) {
    weeks.push(calendarData.slice(i, i + 7));
  }

  if (loading) {
    return (
      <div className="bg-cream border-4 border-dark rounded-2xl p-6 shadow-[6px_6px_0_var(--color-dark)]">
        <div className="h-64 animate-pulse bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-cream border-4 border-dark rounded-2xl p-6 shadow-[6px_6px_0_var(--color-dark)] relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display text-2xl text-dark">Your Contribution Graph</h3>
        <div className="flex items-center gap-2 text-sm font-body font-bold">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-4 h-4 rounded border-2 border-dark ${levelColors[level]}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-[repeat(52,minmax(10px,1fr))] gap-1 min-w-max">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="contents">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`aspect-square rounded-sm border border-dark/10 ${levelColors[getLevel(day.count)]} cursor-pointer hover:scale-125 hover:z-10 hover:border-2 hover:border-dark transition-transform relative`}
                  onMouseEnter={(e) => handleMouseEnter(day, e)}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center font-body font-bold text-gray-600 text-sm">
        Last 365 days (Jakarta Time)
      </div>

      {/* Custom Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-[100] pointer-events-none bg-dark text-white px-3 py-2 rounded-lg border-2 border-orange shadow-[4px_4px_0_var(--color-dark)] text-sm font-body"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y - 40}px`,
          }}
        >
          <div className="font-bold text-orange">{formatDate(hoveredDay.date)}</div>
          <div>{hoveredDay.count} {hoveredDay.count === 1 ? "commit" : "commits"}</div>
        </div>
      )}
    </div>
  );
}
