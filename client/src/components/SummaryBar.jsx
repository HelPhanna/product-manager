import { Package, DollarSign, Hash } from "lucide-react";
import { useProductStore } from "../store";

export default function SummaryBar() {
  const summary = useProductStore((s) => s.summary);
  const fmt = (n) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  const cards = [
    {
      label: "Total Products",
      value: summary.totalProducts,
      icon: Package,
      color: "var(--accent)",
      bg: "rgba(90,90,175,0.12)",
    },
    {
      label: "Total Quantity",
      value: summary.totalQuantity,
      icon: Hash,
      color: "var(--amber)",
      bg: "rgba(251,191,36,0.1)",
    },
    {
      label: "Total Amount",
      value: `$${fmt(summary.totalAmount)}`,
      icon: DollarSign,
      color: "var(--green)",
      bg: "rgba(74,222,128,0.1)",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {cards.map((c) => (
        <div
          key={c.label}
          className="glass-card rounded-2xl p-5 flex items-center gap-4"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: c.bg }}
          >
            <c.icon size={18} style={{ color: c.color }} />
          </div>
          <div>
            <p
              className="text-xs uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              {c.label}
            </p>
            <p
              className="text-xl font-bold font-mono"
              style={{ color: c.color }}
            >
              {c.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
