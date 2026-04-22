import { getInitialKanbanData, useKanbanStore } from "./index"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import {
  __resetCrossTabSyncForTests,
  connectKanbanCrossTabSync,
} from "../lib/crossTabSync"

describe("kanban store", () => {
  beforeEach(() => {
    localStorage.clear()
    useKanbanStore.setState(getInitialKanbanData())
  })

  it("starts with board metadata", () => {
    const state = useKanbanStore.getState()

    expect(state.boardTitle).toBe("zustand kanban board")
    expect(state.columnIds).toEqual([
      "To Do",
      "In Progress",
      "Review",
      "Done",
    ])
  })

  it("addTask appends a task", () => {
    useKanbanStore.getState().addTask({
      id: "task-new",
      title: "New task",
      content: "Body",
      column: "To Do",
    })

    expect(useKanbanStore.getState().tasks.find((t) => t.id === "task-new")?.createdAt).toEqual(
      expect.any(Number),
    )

    const tasks = useKanbanStore.getState().tasks
    expect(tasks.some((t) => t.id === "task-new")).toBe(true)
    expect(tasks[tasks.length - 1].title).toBe("New task")
  })

  it("updateTask merges fields for an existing task", () => {
    useKanbanStore.getState().updateTask("task-1", {
      title: "Fix login bug (updated)",
    })

    const task = useKanbanStore.getState().tasks.find((t) => t.id === "task-1")
    expect(task?.title).toBe("Fix login bug (updated)")
    expect(task?.content).toBe("Users get signed out after refresh.")
  })

  it("moveTask changes the task column", () => {
    useKanbanStore.getState().moveTask("task-1", "In Progress")

    const task = useKanbanStore.getState().tasks.find((t) => t.id === "task-1")
    expect(task?.column).toBe("In Progress")
  })

  it("removeTask drops a task by id", () => {
    useKanbanStore.getState().removeTask("task-4")

    expect(useKanbanStore.getState().tasks.some((t) => t.id === "task-4")).toBe(false)
  })

  it("resetBoard restores sample board data without dropping actions", () => {
    useKanbanStore.getState().removeTask("task-1")
    expect(useKanbanStore.getState().tasks.some((t) => t.id === "task-1")).toBe(false)

    useKanbanStore.getState().resetBoard()

    const state = useKanbanStore.getState()
    expect(state.tasks.some((t) => t.id === "task-1")).toBe(true)
    expect(typeof state.addTask).toBe("function")
  })
})

describe("cross-tab sync", () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>
  let rehydrateSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    __resetCrossTabSyncForTests()
    localStorage.clear()
    useKanbanStore.setState(getInitialKanbanData())

    if (!useKanbanStore.persist) throw new Error("Store missing persist middleware")
    rehydrateSpy = vi.spyOn(useKanbanStore.persist, "rehydrate").mockResolvedValue(undefined)

    addEventListenerSpy = vi.spyOn(window, "addEventListener")
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("calls persist.rehydrate when storage event for KANBAN_STORAGE_KEY is dispatched", async () => {
    connectKanbanCrossTabSync(useKanbanStore)
    const persistedKey = useKanbanStore.persist.getOptions().name
    const oldValue = null
    const newValue = JSON.stringify({ some: "data" })

    const storageListeners = addEventListenerSpy.mock.calls.filter(
      ([event]) => event === "storage"
    )
    expect(storageListeners.length).toBeGreaterThan(0)
    const handler = storageListeners[0][1] as (ev: StorageEvent) => void

    const evt = new StorageEvent("storage", {
      key: persistedKey,
      newValue,
      oldValue,
      storageArea: localStorage,
    })

    handler(evt)

    expect(rehydrateSpy).toHaveBeenCalledOnce()
  })

  it("connectKanbanCrossTabSync is idempotent (registers only one storage listener)", () => {
    connectKanbanCrossTabSync(useKanbanStore)
    connectKanbanCrossTabSync(useKanbanStore)
    const storageListeners = addEventListenerSpy.mock.calls.filter(
      ([event]) => event === "storage"
    )
    expect(storageListeners.length).toBe(1)
  })

})