interface TimeInputProps {
  days: string;
  hours: string;
  minutes: string;
  onChange: (days: string, hours: string, minutes: string) => void;
}

export default function TimeInput({ days, hours, minutes, onChange }: TimeInputProps) {
  const handleChange = (field: "days" | "hours" | "minutes", value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    if (field === "days") onChange(num, hours, minutes);
    else if (field === "hours") onChange(days, num, minutes);
    else onChange(days, hours, num);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <label className="text-xs text-gray-400 mb-1 block text-center">Days</label>
        <input
          type="text"
          inputMode="numeric"
          value={days}
          onChange={(e) => handleChange("days", e.target.value)}
          maxLength={3}
          className="w-full px-3 py-2.5 bg-white rounded-xl text-sm text-gray-800 text-center outline-none focus:ring-2 focus:ring-blue-200 transition-all font-mono"
          placeholder="0"
        />
      </div>
      <span className="text-gray-400 font-bold mt-5">:</span>
      <div className="flex-1">
        <label className="text-xs text-gray-400 mb-1 block text-center">Hours</label>
        <input
          type="text"
          inputMode="numeric"
          value={hours}
          onChange={(e) => handleChange("hours", e.target.value)}
          maxLength={2}
          className="w-full px-3 py-2.5 bg-white rounded-xl text-sm text-gray-800 text-center outline-none focus:ring-2 focus:ring-blue-200 transition-all font-mono"
          placeholder="0"
        />
      </div>
      <span className="text-gray-400 font-bold mt-5">:</span>
      <div className="flex-1">
        <label className="text-xs text-gray-400 mb-1 block text-center">Minutes</label>
        <input
          type="text"
          inputMode="numeric"
          value={minutes}
          onChange={(e) => handleChange("minutes", e.target.value)}
          maxLength={2}
          className="w-full px-3 py-2.5 bg-white rounded-xl text-sm text-gray-800 text-center outline-none focus:ring-2 focus:ring-blue-200 transition-all font-mono"
          placeholder="0"
        />
      </div>
    </div>
  );
}
