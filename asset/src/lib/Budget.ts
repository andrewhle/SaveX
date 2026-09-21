export type BudgetItem = {
  id: string;
  name: string;
  amount: number;
};

export type BudgetSectionId = "income" | "fixed" | "flexible" | "saving";

export type BudgetSection = {
  id: BudgetSectionId;
  title: string;
  description: string;
  itemLabel: string;
  /** Income adds to the plan; expenses and saving take away from it. */
  sign: 1 | -1;
};

export type BudgetState = Record<BudgetSectionId, BudgetItem[]>;

export const BUDGET_SECTIONS: readonly BudgetSection[] = [
  {
    id: "income",
    title: "Income",
    description: "Money coming in this month",
    itemLabel: "income source",
    sign: 1,
  },
  {
    id: "fixed",
    title: "Fixed expense",
    description: "Same amount every month",
    itemLabel: "fixed expense",
    sign: -1,
  },
  {
    id: "flexible",
    title: "Flexible expense",
    description: "Changes month to month",
    itemLabel: "flexible expense",
    sign: -1,
  },
  {
    id: "saving",
    title: "Saving",
    description: "Set aside before spending",
    itemLabel: "saving goal",
    sign: -1,
  },
];

export function createEmptyBudget(): BudgetState {
  return { income: [], fixed: [], flexible: [], saving: [] };
}

export function sumItems(items: BudgetItem[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}
