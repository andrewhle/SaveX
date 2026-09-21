"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, RotateCcw, X } from "lucide-react";
import {
  BUDGET_SECTIONS,
  createEmptyBudget,
  formatCurrency,
  sumItems,
  type BudgetItem,
  type BudgetSection,
  type BudgetSectionId,
  type BudgetState,
} from "@/lib/Budget";
import { fetchBudget, saveBudget } from "@/lib/BudgetRepository";
import { useAuth } from "@/components/AuthProvider";

/** Edits are batched into one write after this much idle time. */
const SAVE_DELAY_MS = 1500;

type SaveStatus = "loading" | "idle" | "saving" | "saved" | "error";

const STATUS_LABEL: Record<SaveStatus, string> = {
  loading: "Loading your budget…",
  idle: "",
  saving: "Saving…",
  saved: "All changes saved",
  error: "Could not reach the database",
};

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return "Unknown error";
}

export function BudgetPlanner() {
  const { user } = useAuth();

  if (!user) return null;

  return <BudgetEditor key={user.id} ownerId={user.id} />;
}

function BudgetEditor({ ownerId }: Readonly<{ ownerId: string }>) {
  const [budget, setBudget] = useState<BudgetState>(createEmptyBudget);
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [pendingSave, setPendingSave] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const removedIdsRef = useRef<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const saved = await fetchBudget();

        if (!cancelled) {
          setBudget(saved);
          setStatus("idle");
        }
      } catch (error) {
        console.error("Failed to load budget", error);
        if (!cancelled) {
          setErrorMessage(toMessage(error));
          setStatus("error");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async () => {
    const removedIds = removedIdsRef.current;
    removedIdsRef.current = [];
    setPendingSave(false);
    setStatus("saving");

    try {
      await saveBudget(budget, ownerId, removedIds);
      setErrorMessage(null);
      setStatus("saved");
    } catch (error) {
      console.error("Failed to save budget", error);
      removedIdsRef.current = [...removedIds, ...removedIdsRef.current];
      setErrorMessage(toMessage(error));
      setStatus("error");
    }
  }, [budget, ownerId]);

  useEffect(() => {
    if (!pendingSave) return;

    const timer = setTimeout(() => void persist(), SAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [pendingSave, persist]);

  const totals = useMemo(() => {
    const income = sumItems(budget.income);
    const spent =
      sumItems(budget.fixed) + sumItems(budget.flexible) + sumItems(budget.saving);

    return { income, spent, leftOver: income - spent };
  }, [budget]);

  function addItem(sectionId: BudgetSectionId) {
    setBudget((current) => ({
      ...current,
      [sectionId]: [
        ...current[sectionId],
        { id: crypto.randomUUID(), name: "", amount: 0 },
      ],
    }));
    setPendingSave(true);
  }

  function removeItem(sectionId: BudgetSectionId, itemId: string) {
    setBudget((current) => ({
      ...current,
      [sectionId]: current[sectionId].filter((item) => item.id !== itemId),
    }));
    removedIdsRef.current = [...removedIdsRef.current, itemId];
    setPendingSave(true);
  }

  function updateItem(
    sectionId: BudgetSectionId,
    itemId: string,
    patch: Partial<Omit<BudgetItem, "id">>,
  ) {
    setBudget((current) => ({
      ...current,
      [sectionId]: current[sectionId].map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    }));
    setPendingSave(true);
  }

  function resetAmounts() {
    setBudget((current) => {
      const next = createEmptyBudget();

      for (const section of BUDGET_SECTIONS) {
        next[section.id] = current[section.id].map((item) => ({
          ...item,
          amount: 0,
        }));
      }

      return next;
    });
    setPendingSave(true);
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">Budget</h1>
          <p className="mt-1 text-sm text-muted">
            Plan where every dollar goes this month.
          </p>
          <span
            className={`text-xs ${status === "error" ? "text-negative" : "text-muted"}`}
            role="status"
          >
            {status === "error" && errorMessage
              ? errorMessage
              : pendingSave
                ? "Unsaved changes"
                : STATUS_LABEL[status]}
          </span>
        </div>

        <button
          type="button"
          onClick={resetAmounts}
          disabled={status === "loading"}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-hover disabled:opacity-50"
        >
          <RotateCcw className="size-4" aria-hidden />
          <span className="hidden sm:inline">Reset amounts</span>
          <span className="sm:hidden">Reset</span>
        </button>
      </header>

      <LeftOverSummary {...totals} />

      <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
        {BUDGET_SECTIONS.map((section) => (
          <BudgetSectionCard
            key={section.id}
            section={section}
            items={budget[section.id]}
            onAdd={() => addItem(section.id)}
            onRemove={(itemId) => removeItem(section.id, itemId)}
            onChange={(itemId, patch) => updateItem(section.id, itemId, patch)}
          />
        ))}
      </div>
    </div>
  );
}

function LeftOverSummary({
  income,
  spent,
  leftOver,
}: Readonly<{ income: number; spent: number; leftOver: number }>) {
  const isOver = leftOver < 0;

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 text-center md:p-6">
      <h2 className="text-sm font-semibold tracking-tight">Left over for budget</h2>
      <p
        className={`mt-1 text-3xl font-semibold tracking-tight md:mt-2 md:text-4xl ${
          isOver ? "text-negative" : "text-positive"
        }`}
      >
        {formatCurrency(leftOver)}
      </p>
      <p className="mt-1 text-sm text-muted md:mt-2">
        {formatCurrency(income)} in − {formatCurrency(spent)} planned out
      </p>
    </section>
  );
}

type BudgetSectionCardProps = Readonly<{
  section: BudgetSection;
  items: BudgetItem[];
  onAdd: () => void;
  onRemove: (itemId: string) => void;
  onChange: (itemId: string, patch: Partial<Omit<BudgetItem, "id">>) => void;
}>;

function BudgetSectionCard({
  section,
  items,
  onAdd,
  onRemove,
  onChange,
}: BudgetSectionCardProps) {
  const total = sumItems(items);

  return (
    <section className="flex min-w-0 flex-col rounded-2xl border border-border bg-surface p-4 md:p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{section.title}</h2>
          <p className="mt-0.5 text-xs text-muted">{section.description}</p>
        </div>
        <span
          className={`text-sm font-semibold ${
            section.sign === 1 ? "text-positive" : "text-negative"
          }`}
        >
          {section.sign === 1 ? "+" : "−"}
          {formatCurrency(total)}
        </span>
      </header>

      <ul className="mt-3 flex flex-col gap-2 md:mt-4">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            <input
              value={item.name}
              onChange={(event) => onChange(item.id, { name: event.target.value })}
              placeholder={`Name of ${section.itemLabel}`}
              aria-label={`${section.title} name`}
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-base placeholder:text-muted focus:border-accent focus:outline-none sm:text-sm"
            />
            <div className="relative w-24 shrink-0 sm:w-32">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.amount || ""}
                onChange={(event) =>
                  onChange(item.id, { amount: Number(event.target.value) || 0 })
                }
                placeholder="0"
                aria-label={`${section.title} amount`}
                className="w-full rounded-lg border border-border bg-background py-2 pr-3 pl-7 text-right text-base tabular-nums placeholder:text-muted focus:border-accent focus:outline-none sm:text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.name || section.itemLabel}`}
              className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-hover hover:text-negative"
            >
              <X className="size-4" aria-hidden />
            </button>
          </li>
        ))}

        {items.length === 0 && (
          <li className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted">
            Nothing here yet.
          </li>
        )}
      </ul>

      <button
        type="button"
        onClick={onAdd}
        className="mt-2 flex items-center gap-2 self-start rounded-lg px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-surface-hover md:mt-3"
      >
        <Plus className="size-4" aria-hidden />
        Add {section.itemLabel}
      </button>
    </section>
  );
}
