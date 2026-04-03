interface CircularTimerProps {
  remaining: number;
  period: number;
}

export default function CircularTimer({ remaining, period }: CircularTimerProps) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / period;
  const dashoffset = circumference * (1 - progress);
  const isLow = remaining <= 5;

  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="flex-shrink-0">
      <circle
        cx="20"
        cy="20"
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="3"
      />
      <circle
        cx="20"
        cy="20"
        r={radius}
        fill="none"
        stroke={isLow ? "#ef4444" : "#4285f4"}
        strokeWidth="3"
        strokeDasharray={circumference}
        strokeDashoffset={dashoffset}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
        style={{ transition: "stroke-dashoffset 0.3s linear" }}
      />
      <text
        x="20"
        y="20"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="bold"
        fill={isLow ? "#ef4444" : "#4285f4"}
      >
        {remaining}
      </text>
    </svg>
  );
}
