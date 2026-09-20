import { Card } from "@/components/Card";

/** Placeholder values — swap for real data once Plaid + a chart library are wired up. */
const NET_WORTH = {
  total: "$95,000",
  assets: "$100,000",
  debts: "$5,000",
};

const MONTHLY_SPENDING = {
  spent: "$1,000",
  lastMonth: "$500",
  status: "$100 under",
};

const CATEGORIES = [
  { name: "Food & Drink", amount: "$368", budget: "$500", percent: 74 },
  { name: "Necessities", amount: "$645", budget: "$1,000", percent: 65 },
  { name: "Shopping", amount: "$76", budget: "$200", percent: 38 },
  { name: "Fun", amount: "$40", budget: "$100", percent: 40 },
];

type CardSlotProps = Readonly<{ className?: string }>;

export function NetWorthCard({ className }: CardSlotProps) {
  return (
    <Card title="Net worth" action="Accounts ›" className={className}>
      <div className="text-center">
        <p className="text-4xl font-semibold tracking-tight">{NET_WORTH.total}</p>
        <p className="mt-2 text-sm text-muted">
          <span className="text-positive">{NET_WORTH.assets} assets</span>
          {" · "}
          <span className="text-negative">{NET_WORTH.debts} debts</span>
        </p>
      </div>
      <ChartSlot label="Net worth chart" />
    </Card>
  );
}

export function MonthlySpendingCard({ className }: CardSlotProps) {
  return (
    <Card title="Monthly spending" action="Transactions ›" className={className}>
      <div className="text-center">
        <p className="text-4xl font-semibold tracking-tight">
          {MONTHLY_SPENDING.spent} spent
        </p>
        <p className="mt-2 text-sm text-muted">
          {MONTHLY_SPENDING.lastMonth} spent last month
        </p>
        <p className="mt-3 inline-block rounded-full bg-positive/15 px-3 py-1 text-xs font-medium text-positive">
          {MONTHLY_SPENDING.status}
        </p>
      </div>
      <ChartSlot label="Spending trend chart" />
    </Card>
  );
}

export function SpendingCategoriesCard({ className }: CardSlotProps) {
  return (
    <Card title="Spending categories" action="Categories ›" className={className}>
      <ul className="space-y-3">
        {CATEGORIES.map((category) => (
          <li key={category.name} className="flex items-center gap-3 text-sm">
            <span className="w-28 shrink-0 truncate">{category.name}</span>
            <span className="w-14 shrink-0 text-right font-medium">
              {category.amount}
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-background">
              <span
                className="block h-full rounded-full bg-accent"
                style={{ width: `${category.percent}%` }}
              />
            </span>
            <span className="w-14 shrink-0 text-right text-muted">
              {category.budget}
            </span>
          </li>
        ))}
      </ul>
      <ChartSlot label="Category breakdown chart" />
    </Card>
  );
}

function ChartSlot({ label }: Readonly<{ label: string }>) {
  return (
    <div className="mt-6 grid h-24 place-items-center rounded-xl border border-dashed border-border text-xs text-muted">
      {label}
    </div>
  );
}
