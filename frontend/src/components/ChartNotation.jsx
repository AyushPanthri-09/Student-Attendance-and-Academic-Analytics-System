export default function ChartNotation({ title = 'Chart Guide', items = [] }) {
  if (!items.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600 mb-3">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between rounded-xl bg-white border border-slate-100 px-3 py-2.5">
            <div className="flex items-center gap-2">
              {item.color && <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></span>}
              <span className="text-xs sm:text-sm font-semibold text-slate-700">{item.label}</span>
            </div>
            {item.value !== undefined && <span className="text-xs sm:text-sm font-black text-slate-900">{item.value}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
