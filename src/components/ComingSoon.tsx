import type { LucideIcon } from "lucide-react";

export default function ComingSoon({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-subText">
      <Icon size={40} strokeWidth={1.5} />
      <p className="text-lg font-medium text-text">{label}</p>
      <p className="text-sm">
        This tool isn't built yet — coming in a future milestone.
      </p>
    </div>
  );
}
