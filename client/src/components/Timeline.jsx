export default function Timeline({ events = [] }) {
  const months = Array.from({ length: 12 }).map((_, idx) => idx + 1);

  return (
    <section className="glass-card pastel-border p-4">
      <h3 className="cute-title text-lg font-bold">Timeline</h3>
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12">
        {months.map((month) => {
          const monthlyEvents = events.filter((event) => Number(event.month) === month);

          return (
            <article key={month} className="rounded-2xl border border-[#ecd6e8] bg-white/80 p-2">
              <p className="cute-title text-xs font-bold">M{month}</p>
              <div className="mt-1 space-y-1">
                {monthlyEvents.length === 0 ? <p className="cute-subtext text-[11px]">-</p> : null}
                {monthlyEvents.map((event) => (
                  (() => {
                    const amount = Number(event.amount) || 0;
                    const isPositive = amount >= 0;

                    return (
                  <p
                    key={event.id}
                    className={`truncate rounded-xl px-2 py-1 text-[11px] ${isPositive ? "bg-[#e8f8ef] text-[#4b9471]" : "bg-[#ffeef6] text-[#896f93]"}`}
                  >
                    {event.name} ({isPositive ? "+" : ""}{amount})
                  </p>
                    );
                  })()
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
