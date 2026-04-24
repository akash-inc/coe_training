export const queryKeys = {
  allSummaries: ['pokemon', 'all-summaries'] as const,
  details: (id: number) => ['pokemon', 'details', id] as const,
}
