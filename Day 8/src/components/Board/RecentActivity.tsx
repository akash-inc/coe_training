import { useShallow } from "zustand/react/shallow"
import { useKanbanStore } from "../../store"
import "./RecentActivity.css"

export default function RecentActivity() {
  const {
    activityLog,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useKanbanStore(
    useShallow((s) => ({
      activityLog: s.activityLog,
      undo: s.undo,
      redo: s.redo,
      canUndo: s.pastSnapshots.length > 0,
      canRedo: s.futureSnapshots.length > 0,
    })),
  )

  const displayed = [...activityLog].reverse()

  return (
    <section
      className="recent-activity"
      aria-label="Recent activity"
    >
      <div className="recent-activity-header">
        <h2 className="recent-activity-title">Recent activity</h2>
        <div className="recent-activity-actions">
          <button
            type="button"
            className="recent-activity-btn"
            disabled={!canUndo}
            onClick={() => undo()}
          >
            Undo
          </button>
          <button
            type="button"
            className="recent-activity-btn"
            disabled={!canRedo}
            onClick={() => redo()}
          >
            Redo
          </button>
        </div>
      </div>
      <ol className="recent-activity-list">
        {displayed.map((entry) => (
          <li key={entry.id} className="recent-activity-item">
            <span className="recent-activity-type">{entry.type}</span>
            <span className="recent-activity-summary">{entry.summary}</span>
            <time
              className="recent-activity-time"
              dateTime={new Date(entry.at).toISOString()}
            >
              {new Date(entry.at).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </time>
          </li>
        ))}
      </ol>
    </section>
  )
}
