import { createActor, type SnapshotFrom } from "xstate"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  onboardingMachine,
  type OnboardingEvent,
} from "../lib/onboarding/onboarding.machine"
import { ONBOARDING_PERSIST_KEY } from "../lib/onboardingStorageKeys"

function bootstrapSnapshot(): SnapshotFrom<typeof onboardingMachine> {
  const a = createActor(onboardingMachine, { input: { userId: "" } })
  a.start()
  const s = a.getSnapshot()
  a.stop()
  return s
}

type OnboardingStoreState = {
  completedUserIds: string[]
  persistHydrated: boolean
  snapshot: SnapshotFrom<typeof onboardingMachine>
  bindUser: (userId: string) => void
  send: (event: OnboardingEvent) => void
  isCompleteForUser: (userId: string) => boolean
  markUserCompleted: (userId: string) => void
  clearOnSignOut: () => void
}

let actor: ReturnType<typeof createActor<typeof onboardingMachine>> | null = null
let boundUserId: string | null = null

export const useOnboardingStore = create<OnboardingStoreState>()(
  persist(
    (set, get) => {
      const attachActor = (userId: string) => {
        if (actor != null) {
          actor.stop()
          actor = null
        }
        boundUserId = userId
        const next = createActor(onboardingMachine, { input: { userId } })
        actor = next
        next.subscribe((snapshot) => {
          set({ snapshot })
          if (snapshot.matches("success")) {
            const uid = snapshot.context.userId
            if (uid.length > 0 && !get().completedUserIds.includes(uid)) {
              get().markUserCompleted(uid)
            }
          }
        })
        next.start()
        set({ snapshot: next.getSnapshot() })
      }

      return {
        completedUserIds: [],
        persistHydrated: false,
        snapshot: bootstrapSnapshot(),

        bindUser: (userId: string) => {
          if (userId.length === 0) {
            return
          }
          if (boundUserId === userId && actor != null) {
            set({ snapshot: actor.getSnapshot() })
            return
          }
          attachActor(userId)
        },

        send: (event: OnboardingEvent) => {
          actor?.send(event)
        },

        isCompleteForUser: (userId: string) =>
          get().completedUserIds.includes(userId),

        markUserCompleted: (userId: string) => {
          set((state) =>
            state.completedUserIds.includes(userId)
              ? state
              : { completedUserIds: [...state.completedUserIds, userId] },
          )
        },

        clearOnSignOut: () => {
          if (actor != null) {
            actor.stop()
            actor = null
          }
          boundUserId = null
          set({ snapshot: bootstrapSnapshot() })
        },
      }
    },
    {
      name: ONBOARDING_PERSIST_KEY,
      partialize: (state) => ({
        completedUserIds: state.completedUserIds,
      }),
      // Set as soon as persisted slice is merged; do not wait for the trailing
      // rehydration then-chain (a hanging setItem Promise would otherwise block
      // persistHydrated forever).
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(typeof persistedState === "object" && persistedState != null
          ? (persistedState as { completedUserIds?: string[] })
          : {}),
        persistHydrated: true,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error != null) {
          useOnboardingStore.setState({ persistHydrated: true })
        }
      },
    },
  ),
)
