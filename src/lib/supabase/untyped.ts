type UpsertOptions = {
  onConflict?: string;
};

export type UntypedMutationResult = {
  error: { message: string } | null;
};

type UntypedUpsertTable = {
  upsert(
    values: Record<string, unknown> | Record<string, unknown>[],
    options?: UpsertOptions
  ): Promise<UntypedMutationResult>;
};

export function asUpsertTable(table: unknown): UntypedUpsertTable {
  return table as UntypedUpsertTable;
}
