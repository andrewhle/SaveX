import {
  MonthlySpendingCard,
  NetWorthCard,
  SpendingCategoriesCard,
} from "@/components/DashboardCards";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          A snapshot of where your money is right now.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlySpendingCard />
        <NetWorthCard />
        <SpendingCategoriesCard className="lg:col-span-2" />
      </div>
    </div>
  );
}
