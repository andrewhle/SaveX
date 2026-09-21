import { supabase } from "@/lib/SupabaseClient";
import {
  BUDGET_SECTIONS,
  createEmptyBudget,
  type BudgetSectionId,
  type BudgetState,
} from "@/lib/Budget";

const TABLE = "budget_items";

type SupabaseError = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

/** Supabase returns plain objects, which lose their message when thrown as-is. */
function toError(error: SupabaseError): Error {
  const detail = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(" — ");

  const wrapped = new Error(detail || "Supabase request failed");
  wrapped.name = error.code ? `SupabaseError ${error.code}` : "SupabaseError";

  return wrapped;
}

type BudgetRow = {
  id: string;
  section: BudgetSectionId;
  name: string;
  amount: number | string;
  position: number;
};

export async function fetchBudget(): Promise<BudgetState> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, section, name, amount, position")
    .order("position", { ascending: true });

  if (error) throw toError(error);

  const budget = createEmptyBudget();

  for (const row of (data ?? []) as BudgetRow[]) {
    budget[row.section]?.push({
      id: row.id,
      name: row.name,
      amount: Number(row.amount),
    });
  }

  return budget;
}

/**
 * Writes the whole budget in one upsert (plus one delete when rows were removed),
 * so a save costs at most two requests no matter how many fields changed.
 */
export async function saveBudget(
  budget: BudgetState,
  ownerId: string,
  removedIds: string[],
): Promise<void> {
  const rows = BUDGET_SECTIONS.flatMap((section) =>
    budget[section.id].map((item, index) => ({
      id: item.id,
      owner_id: ownerId,
      section: section.id,
      name: item.name,
      amount: item.amount,
      position: index,
    })),
  );

  if (removedIds.length > 0) {
    const { error } = await supabase.from(TABLE).delete().in("id", removedIds);
    if (error) throw toError(error);
  }

  if (rows.length > 0) {
    const { error } = await supabase.from(TABLE).upsert(rows);
    if (error) throw toError(error);
  }
}
