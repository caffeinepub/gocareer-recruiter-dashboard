interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  trend?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-card p-5 flex items-start gap-4">
      <div
        className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-slate-800">
          {value}
        </p>
        <p className="text-slate-500 text-sm mt-0.5">{label}</p>
        {trend && (
          <p className="text-emerald-600 text-xs font-medium mt-1">{trend}</p>
        )}
      </div>
    </div>
  );
}
