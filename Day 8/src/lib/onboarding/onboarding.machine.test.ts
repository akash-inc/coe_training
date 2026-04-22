import { createActor } from "xstate"
import { describe, expect, it } from "vitest"
import { onboardingMachine } from "./onboarding.machine"

describe("onboardingMachine", () => {
  it("does not move past name when display name is empty", () => {
    const actor = createActor(onboardingMachine, { input: { userId: "u1" } })
    actor.start()
    expect(actor.getSnapshot().matches("collectDisplayName")).toBe(true)
    actor.send({ type: "NEXT" })
    expect(actor.getSnapshot().matches("collectDisplayName")).toBe(true)
  })

  it("moves to use case after non-empty name and NEXT", () => {
    const actor = createActor(onboardingMachine, { input: { userId: "u1" } })
    actor.start()
    actor.send({ type: "SET_DISPLAY_NAME", value: "  Ada  " })
    actor.send({ type: "NEXT" })
    expect(actor.getSnapshot().matches("collectUseCase")).toBe(true)
  })

  it("goes back from use case to name", () => {
    const actor = createActor(onboardingMachine, { input: { userId: "u1" } })
    actor.start()
    actor.send({ type: "SET_DISPLAY_NAME", value: "Ada" })
    actor.send({ type: "NEXT" })
    expect(actor.getSnapshot().matches("collectUseCase")).toBe(true)
    actor.send({ type: "BACK" })
    expect(actor.getSnapshot().matches("collectDisplayName")).toBe(true)
  })

  it("reaches success after FINISH then API_SUCCESS (network flow in UI)", () => {
    const actor = createActor(onboardingMachine, { input: { userId: "u1" } })
    actor.start()
    actor.send({ type: "SET_DISPLAY_NAME", value: "Ada" })
    actor.send({ type: "NEXT" })
    actor.send({ type: "SET_USE_CASE", value: "team" })
    actor.send({ type: "FINISH" })
    expect(actor.getSnapshot().matches("submitting")).toBe(true)
    actor.send({ type: "API_SUCCESS" })
    expect(actor.getSnapshot().matches("success")).toBe(true)
  })

  it("returns to use case with error on API_FAILURE", () => {
    const actor = createActor(onboardingMachine, { input: { userId: "u1" } })
    actor.start()
    actor.send({ type: "SET_DISPLAY_NAME", value: "Ada" })
    actor.send({ type: "NEXT" })
    actor.send({ type: "FINISH" })
    actor.send({ type: "API_FAILURE", message: "Server said no" })
    const snap = actor.getSnapshot()
    expect(snap.matches("collectUseCase")).toBe(true)
    expect(snap.context.error).toBe("Server said no")
  })
})
