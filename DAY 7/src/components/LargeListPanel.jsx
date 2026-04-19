import { List } from 'react-window'
import { markRender } from './RenderCounter.js'
import ExerciseStatusToggle from './ExerciseStatusToggle.jsx'

function VirtualizedRow({ index, style, items }) {
  const item = items[index]

  return (
    <div className="list-row" style={style} data-ex8-row="true">
      <span>{item.title}</span>
      <span>{item.category}</span>
      <span>{item.score}</span>
    </div>
  )
}

function LargeListPanel({ items, isImplementedProperly, onToggleStatus }) {
  markRender('LargeListPanel')

  return (
    <section className="panel">
      <div className="exercise-header">
        <h3>Exercise 8 - Only draw what the user can see</h3>
        <ExerciseStatusToggle
          isImplementedProperly={isImplementedProperly}
          onToggleStatus={onToggleStatus}
        />
      </div>
      <p className="exercise-objective">
        Goal: we have thousands of rows below. Drawing all of them is slow.
        Learn to use <code>react-window</code> so the browser only draws the
        rows that fit on the screen right now (and reuses them while you
        scroll).
      </p>
      <div className="list-box" data-ex8-list="true">
        <List
          rowComponent={VirtualizedRow}
          rowCount={items.length}
          rowHeight={36}
          rowProps={{ items }}
          style={{ height: 240 }}
        />
      </div>
      <p className="meta">
        Rows drawn now are virtualized (only visible rows are mounted).
      </p>
    </section>
  )
}

export default LargeListPanel
