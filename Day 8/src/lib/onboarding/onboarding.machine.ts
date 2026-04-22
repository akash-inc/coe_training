import { assign, setup } from "xstate"

export const USE_CASE_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "personal", label: "Personal tasks" },
  { value: "team", label: "Team / work" },
  { value: "learning", label: "Learning / experiments" },
] as const

export type OnboardingContext = {
  userId: string
  displayName: string
  /** Empty string = optional / not set */
  useCase: string
  error: string | null
}

export type OnboardingEvent =
  | { type: "BACK" }
  | { type: "NEXT" }
  | { type: "SET_DISPLAY_NAME"; value: string }
  | { type: "SET_USE_CASE"; value: string }
  | { type: "FINISH" }
  | { type: "API_SUCCESS" }
  | { type: "API_FAILURE"; message: string }
  | { type: "RESET" }

const onboardingMachine = setup({
  types: {
    input: {} as { userId: string },
    context: {} as OnboardingContext,
    events: {} as OnboardingEvent,
  },
  guards: {
    canLeaveName: ({ context }) => context.displayName.trim().length > 0,
  },
}).createMachine({
  id: "onboarding",
  context: ({ input }) => ({
    userId: input.userId,
    displayName: "",
    useCase: "",
    error: null,
  }),
  initial: "collectDisplayName",
  states: {
    collectDisplayName: {
      on: {
        SET_DISPLAY_NAME: {
          actions: assign({
            displayName: ({ event }) => event.value,
            error: null,
          }),
        },
        NEXT: {
          guard: "canLeaveName",
          target: "collectUseCase",
        },
      },
    },
    collectUseCase: {
      on: {
        SET_USE_CASE: {
          actions: assign({
            useCase: ({ event }) => event.value,
            error: null,
          }),
        },
        BACK: { target: "collectDisplayName" },
        FINISH: { target: "submitting" },
      },
    },
    submitting: {
      entry: assign({ error: null }),
      on: {
        API_SUCCESS: { target: "success" },
        API_FAILURE: {
          target: "collectUseCase",
          actions: assign({
            error: ({ event }) =>
              event.type === "API_FAILURE" ? event.message : "Save failed.",
          }),
        },
      },
    },
    success: { type: "final" },
  },
  on: {
    RESET: { target: ".collectDisplayName", reenter: true },
  },
})

export { onboardingMachine }
