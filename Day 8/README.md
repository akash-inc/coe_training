# 🎯 Zustand Kanban Board - Master Plan

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         ZUSTAND STORE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Board Slice  │  │ Tasks Slice  │  │ Users Slice  │          │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤          │
│  │ - boardData  │  │ - tasks: {}  │  │ - users: {}  │          │
│  │ - metadata   │  │ - optimistic │  │ - currentUser│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────────────────────────────┐    │
│  │Filters Slice │  │     COMPUTED/SELECTORS               │    │
│  ├──────────────┤  ├──────────────────────────────────────┤    │
│  │ - search     │  │ - getFilteredTasks()                 │    │
│  │ - assignees  │  │ - getTasksByColumn()                 │    │
│  │ - priorities │  │ - getColumnStats()                   │    │
│  │ - sortBy     │  │ - canTransitionTask()                │    │
│  └──────────────┘  └──────────────────────────────────────┘    │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                         MIDDLEWARE LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐        │
│  │   Immer     │  │   Persist    │  │  Cross-Tab Sync │        │
│  │ (mutations) │  │ (localStorage)│  │ (BroadcastAPI)  │        │
│  └─────────────┘  └──────────────┘  └─────────────────┘        │
│                                                                   │
│  ┌─────────────┐                                                 │
│  │  DevTools   │  ← Debug state changes                         │
│  └─────────────┘                                                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      REACT COMPONENTS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Board → Column → TaskCard → User Avatar                        │
│         ↑                                                         │
│    FilterBar (controls filters slice)                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 State Flow Diagram

```
USER ACTION (Click/Drag)
    ↓
┌─────────────────────────┐
│   Component Handler     │
│  (e.g., onDragEnd)      │
└─────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│   Custom Hook (useTaskActions)          │
│   - Validates state machine transitions │
│   - Prepares optimistic update          │
└─────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────┐
│  OPTIMISTIC UPDATE                            │
│  1. Store rollback data                       │
│  2. Immediately update UI (set state)         │
│  3. Trigger async API call (mock)             │
└──────────────────────────────────────────────┘
    ↓                                    ↓
┌─────────────┐                  ┌─────────────┐
│  SUCCESS    │                  │   FAILURE   │
│  - Commit   │                  │  - Rollback │
│  - Clear    │                  │  - Restore  │
└─────────────┘                  └─────────────┘
    ↓
┌──────────────────────────────┐
│   MIDDLEWARE CHAIN           │
│   1. Immer (mutate safely)   │
│   2. Persist (save to local) │
│   3. CrossTab (broadcast)    │
│   4. DevTools (log)          │
└──────────────────────────────┘
    ↓
┌──────────────────────────────┐
│  STATE UPDATED               │
│  Components re-render        │
└──────────────────────────────┘
```

---

## 🗂️ File Structure

```
src/
├── store/
│   ├── index.ts                    # 🎯 Root store (combines all slices)
│   ├── types.ts                    # 📝 All TypeScript interfaces
│   │
│   ├── slices/
│   │   ├── boardSlice.ts           # Board metadata
│   │   ├── tasksSlice.ts           # Tasks CRUD + optimistic
│   │   ├── usersSlice.ts           # User management
│   │   └── filtersSlice.ts         # Filtering/sorting state
│   │
│   ├── selectors/
│   │   ├── taskSelectors.ts        # Computed/derived values
│   │   └── columnSelectors.ts      # Column-specific logic
│   │
│   └── middleware/
│       ├── crossTabSync.ts         # BroadcastChannel sync
│       └── persistConfig.ts        # localStorage config
│
├── components/
│   ├── Board/
│   │   ├── Board.tsx               # Main board container
│   │   ├── Column.tsx              # Status column
│   │   └── TaskCard.tsx            # Draggable task card
│   │
│   ├── Filters/
│   │   └── FilterBar.tsx           # Search, filters, sort
│   │
│   └── UI/
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       └── Dropdown.tsx
│
├── hooks/
│   ├── useTaskActions.ts           # Task CRUD actions wrapper
│   ├── useOptimistic.ts            # Optimistic update logic
│   └── useDragAndDrop.ts           # DnD handlers
│
├── utils/
│   ├── stateMachine.ts             # Task status transitions
│   ├── mockApi.ts                  # Simulated API calls
│   └── sortHelpers.ts              # Sorting utilities
│
└── App.tsx                          # Root component
```

---

## 📚 Learning Phases (10-Day Plan)

### **Phase 1: Foundation (Days 1-2)**
**Goal:** Setup slices with TypeScript

```
✅ Define all types (Task, User, Board, Filters)
✅ Create basic slices (no middleware yet)
✅ Combine slices in store/index.ts
✅ Build simple UI to display tasks by column
```

**Key Learnings:**
- Slice pattern with `StateCreator`
- Type-safe store with generics
- Basic actions (add, update, delete)

---

### **Phase 2: Middleware Magic (Days 3-4)**
**Goal:** Add Immer, Persist, DevTools

```
✅ Wrap store with immer() middleware
✅ Add persist() for localStorage
✅ Enable devtools() for debugging
✅ Test state mutations with draft syntax
```

**Key Learnings:**
- Immer draft mutations vs immutable updates
- Persist configuration (whitelist/blacklist)
- DevTools time-travel debugging

---

### **Phase 3: Computed State (Day 5)**
**Goal:** Selectors for filtering and stats

```
✅ Create getFilteredTasks() selector
✅ Build getTasksByColumn() for board columns
✅ Add getColumnStats() for task counts
✅ Implement multi-criteria sorting
```

**Key Learnings:**
- Selector patterns (avoid re-renders)
- Derived state from multiple slices
- Memoization with selectors

---

### **Phase 4: State Machine (Days 6-7)**
**Goal:** Task status workflow validation

```
✅ Define TASK_TRANSITIONS map
✅ Implement canTransitionTask() validator
✅ Add moveTask() with state machine logic
✅ UI shows only valid next states
```

**State Machine Diagram:**
```
┌──────┐     ┌─────────────┐     ┌────────┐     ┌──────┐
│ TODO │────→│ IN-PROGRESS │────→│ REVIEW │────→│ DONE │
└──────┘     └─────────────┘     └────────┘     └──────┘
   ↑              ↓                    ↓             ↓
   └──────────────┴────────────────────┴─────────────┘
         (Allow going back to TODO from any state)
```

**Key Learnings:**
- Finite state machines
- Validation before state updates
- UI constraints based on current state

---

### **Phase 5: Optimistic Updates (Days 8-9)**
**Goal:** Instant UI, rollback on failure

```
✅ Add optimisticUpdates tracking in slice
✅ Create rollback mechanism
✅ Mock async API calls (setTimeout)
✅ Handle success/failure scenarios
```

**Flow:**
```
User drags task → Column A to Column B
    ↓
1. Store current state (rollback point)
2. Update UI immediately (optimistic)
3. Call mockApi.updateTask() [2 sec delay]
    ↓
SUCCESS: Clear rollback data
FAILURE: Restore from rollback → Show error toast
```

**Key Learnings:**
- Optimistic vs pessimistic updates
- Rollback patterns
- Error handling with state restoration

---

### **Phase 6: Cross-Tab Sync (Day 10)**
**Goal:** Multiple tabs stay in sync

```
✅ Create BroadcastChannel subscriber
✅ Listen for external state changes
✅ Merge incoming updates
✅ Test with 2 browser tabs side-by-side
```

**Architecture:**
```
Tab 1: User updates task
   ↓
Store updated
   ↓
BroadcastChannel.postMessage(newState)
   ↓
Tab 2: Receives message
   ↓
Merge state → Re-render
```

**Key Learnings:**
- BroadcastChannel API
- State synchronization strategies
- Conflict resolution

---

## 🎨 UI/UX Features

### **Drag-and-Drop**
- Use `@dnd-kit/core` or native HTML5 DnD
- Visual feedback during drag
- Column highlighting on hover

### **Filters Panel**
```
┌────────────────────────────────────────┐
│  🔍 Search: [___________]              │
│                                        │
│  👤 Assignee: [All] [Alice] [Bob]     │
│  🎯 Priority: [All] [High] [Medium]   │
│  🏷️  Tags: [Frontend] [Bug] [Feature] │
│  📊 Sort: [Created ▼] [Priority ▲]    │
└────────────────────────────────────────┘
```

### **Task Card Design**
```
┌─────────────────────────────────┐
│  [!] Fix login bug         [👤] │ ← Priority + Avatar
│  ──────────────────────────     │
│  Description preview...         │
│  🏷️ bug  frontend              │ ← Tags
│  📅 2h ago                       │ ← Timestamp
└─────────────────────────────────┘
```

---

## 🧪 Testing Checklist

### **State Machine Tests**
- ✅ Can move TODO → IN-PROGRESS
- ✅ Cannot move TODO → DONE directly
- ✅ Can move DONE → TODO (restart)

### **Optimistic Update Tests**
- ✅ UI updates before API response
- ✅ Rollback on API failure
- ✅ Multiple optimistic updates in queue

### **Cross-Tab Tests**
- ✅ Create task in Tab 1 → appears in Tab 2
- ✅ Delete task in Tab 2 → removed from Tab 1
- ✅ Both tabs show same filtered results

### **Persistence Tests**
- ✅ Reload page → state restored
- ✅ localStorage has correct data
- ✅ Partial persist (don't save filters)

---

## 🚀 Advanced Challenges (After Completion)

1. **Undo/Redo System**
   - Store action history
   - Time-travel through states

2. **Real-time Collaboration**
   - Replace mock API with WebSocket
   - Show who's editing what

3. **Batch Operations**
   - Multi-select tasks
   - Bulk status change

4. **Performance Optimization**
   - Virtualized lists (1000+ tasks)
   - Shallow equality selectors

---

## 📖 Key Concepts Summary

| Concept | What You'll Learn | Where Used |
|---------|------------------|------------|
| **Slices** | Modular state separation | All 4 slices |
| **Immer** | Mutable-style updates safely | Tasks slice |
| **Persist** | State survival across reloads | All slices |
| **DevTools** | Time-travel debugging | Everywhere |
| **TypeScript** | Full type safety | All files |
| **Selectors** | Computed/derived state | taskSelectors.ts |
| **State Machine** | Controlled state transitions | moveTask() |
| **Optimistic** | Instant UI, async confirmation | Task updates |
| **Cross-Tab** | Multi-window synchronization | BroadcastChannel |
| **Flux** | Unidirectional data flow | Action → Reducer pattern |

---

## 🎯 Success Metrics

By the end, you should be able to:

✅ Explain when to use slices vs monolithic store  
✅ Debug state with DevTools time-travel  
✅ Implement rollback for failed operations  
✅ Build type-safe stores with zero `any`  
✅ Synchronize state across browser tabs  
✅ Validate state transitions with state machines  
✅ Optimize re-renders with selectors  
✅ Persist only necessary data to localStorage  

---

**Start with Phase 1, build incrementally, and you'll master Zustand! 🚀**