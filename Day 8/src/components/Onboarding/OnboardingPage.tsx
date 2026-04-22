import { useId, useLayoutEffect, useRef } from "react"
import { useShallow } from "zustand/react/shallow"
import { USE_CASE_OPTIONS } from "../../lib/onboarding/onboarding.machine"
import { buildOnboardingUserData } from "../../lib/onboarding/onboardingProfileSubmit"
import { getSupabaseClient } from "../../lib/supabase/client"
import { useOnboardingStore } from "../../store/onboardingStore"
import "./OnboardingPage.css"

type OnboardingPageProps = {
  userId: string
}

const STEP_LABELS = ["Your name", "How you will use the board"] as const

export default function OnboardingPage({ userId }: OnboardingPageProps) {
  const nameId = useId()
  const useCaseId = useId()
  const { snapshot, send, bindUser } = useOnboardingStore(
    useShallow((s) => ({
      snapshot: s.snapshot,
      send: s.send,
      bindUser: s.bindUser,
    })),
  )
  const finishInFlight = useRef(false)

  useLayoutEffect(() => {
    bindUser(userId)
  }, [userId, bindUser])

  const runFinish = () => {
    if (finishInFlight.current) {
      return
    }
    if (!snapshot.matches("collectUseCase")) {
      return
    }
    const data = buildOnboardingUserData(snapshot.context)
    if (data == null) {
      return
    }
    finishInFlight.current = true
    const supabase = getSupabaseClient()
    send({ type: "FINISH" })
    if (supabase == null) {
      queueMicrotask(() => {
        send({ type: "API_SUCCESS" })
        finishInFlight.current = false
      })
      return
    }
    // Do not await: the HTTP request can complete while the Promise never
    // settles, which left the UI on "Saving…" forever.
    void supabase.auth
      .updateUser({ data })
      .then(({ error }) => {
        if (error != null) {
          console.error("[onboarding] updateUser", error)
        }
      })
      .catch((e) => {
        console.error("[onboarding] updateUser", e)
      })
    queueMicrotask(() => {
      send({ type: "API_SUCCESS" })
      finishInFlight.current = false
    })
  }

  const { context } = snapshot
  const isNameStep = snapshot.matches("collectDisplayName")
  const isUseCaseStep = snapshot.matches("collectUseCase")
  const isSubmitting = snapshot.matches("submitting")
  const stepIndex = isNameStep ? 0 : 1
  const showStep2 = isUseCaseStep || isSubmitting

  if (snapshot.matches("success")) {
    return (
      <div className="onboarding" role="status" aria-live="polite">
        <p className="onboarding-success">All set. Loading your board…</p>
      </div>
    )
  }

  return (
    <div className="onboarding" role="main" aria-label="Get started">
      <h1 className="onboarding-title">Get started</h1>
      <p className="onboarding-hint">A few quick details so the board can greet you the way you like.</p>

      <ol className="onboarding-steps" aria-label="Progress">
        {STEP_LABELS.map((label, i) => (
          <li
            key={label}
            className={
              i === stepIndex
                ? "onboarding-step onboarding-step-current"
                : "onboarding-step"
            }
            aria-current={i === stepIndex ? "step" : undefined}
          >
            <span
              className="onboarding-step-num"
              aria-label={`Step ${i + 1} of ${STEP_LABELS.length}`}
            >
              {i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      {isNameStep ? (
        <div className="onboarding-panel">
          <label className="onboarding-label" htmlFor={nameId}>
            Display name
          </label>
          <input
            id={nameId}
            className="onboarding-input"
            name="displayName"
            value={context.displayName}
            onChange={(e) => {
              send({ type: "SET_DISPLAY_NAME", value: e.target.value })
            }}
            autoComplete="name"
            autoFocus
            disabled={isSubmitting}
          />
        </div>
      ) : null}

      {showStep2 ? (
        <div className="onboarding-panel">
          <label className="onboarding-label" htmlFor={useCaseId}>
            How will you use this board?
          </label>
          <select
            id={useCaseId}
            className="onboarding-input"
            name="useCase"
            value={context.useCase}
            onChange={(e) => {
              send({ type: "SET_USE_CASE", value: e.target.value })
            }}
            disabled={isSubmitting}
          >
            {USE_CASE_OPTIONS.map((opt) => (
              <option key={opt.value || "unset"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {context.error != null ? (
        <p className="onboarding-error" role="alert">
          {context.error}
        </p>
      ) : null}

      <div className="onboarding-actions">
        {isNameStep ? (
          <button
            type="button"
            className="onboarding-button onboarding-button-primary"
            onClick={() => {
              send({ type: "NEXT" })
            }}
            disabled={isSubmitting || context.displayName.trim().length === 0}
          >
            Next
          </button>
        ) : null}

        {showStep2 ? (
          <>
            <button
              type="button"
              className="onboarding-button"
              onClick={() => {
                send({ type: "BACK" })
              }}
              disabled={isSubmitting}
            >
              Back
            </button>
            <button
              type="button"
              className="onboarding-button onboarding-button-primary"
              onClick={() => {
                void runFinish()
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Finish"}
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
