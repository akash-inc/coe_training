import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import { teamRosterQuery } from '../lib/queryOptions'
import {
  applyTeamToggle,
  readTeamFromStorage,
  writeTeamToStorage,
} from '../lib/teamStorage'
import { getSimulateTeamMutationFailure, setSimulateTeamMutationFailure } from '../lib/teamMutationSimulate'

function delay(ms: number) {
  return new Promise((r) => {
    setTimeout(r, ms)
  })
}

export { getSimulateTeamMutationFailure, setSimulateTeamMutationFailure }

export function useTeamRoster() {
  return useQuery(teamRosterQuery())
}

type ToggleCtx = { previous: number[] | undefined }

export function useTeamToggle() {
  const queryClient = useQueryClient()
  return useMutation<number[], Error, { pokemonId: number }, ToggleCtx>({
    mutationKey: ['pokemon', 'team', 'toggle'],
    meta: { label: 'Team toggle' } as const,
    onMutate: async ({ pokemonId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.team })
      const previous = queryClient.getQueryData<number[]>(queryKeys.team) ?? readTeamFromStorage()
      const next = applyTeamToggle(pokemonId, previous)
      queryClient.setQueryData(queryKeys.team, next)
      return { previous }
    },
    onError: (_err, _v, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.team, context.previous)
      } else {
        queryClient.setQueryData(queryKeys.team, readTeamFromStorage())
      }
    },
    onSettled: () => {
      const cur = queryClient.getQueryData<number[]>(queryKeys.team) ?? readTeamFromStorage()
      writeTeamToStorage(cur)
    },
    mutationFn: async () => {
      await delay(250)
      if (getSimulateTeamMutationFailure()) {
        throw new Error('Simulated team save failure (see cache controls).')
      }
      return queryClient.getQueryData<number[]>(queryKeys.team) ?? readTeamFromStorage()
    },
  })
}
