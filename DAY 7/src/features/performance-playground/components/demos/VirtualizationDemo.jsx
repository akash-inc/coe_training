import { useEffect, useMemo, useState } from 'react'
import { List } from 'react-window'
import ComparisonPanel from '../ComparisonPanel.jsx'
import { buildListItems } from '../../utils/mockData.js'

const LARGE_LIST = buildListItems(50000)

function VirtualizedRow({ index, style, rows }) {
  const row = rows[index]
  return (
    <div className="virtual-row" style={style}>
      {row.label}
    </div>
  )
}

function VirtualizationDemo({ stressSignal, onMetrics }) {
  const [visibleRightCount, setVisibleRightCount] = useState(0)

  useEffect(() => {
    if (stressSignal > 0) {
      const timerId = window.setTimeout(() => {
        setVisibleRightCount((value) => Math.max(value, 30))
      }, 0)
      return () => {
        window.clearTimeout(timerId)
      }
    }
    return undefined
  }, [stressSignal])

  const badStats = useMemo(
    () => ({ renders: LARGE_LIST.length, timeMs: 250 }),
    [],
  )
  const goodStats = useMemo(
    () => ({ renders: Math.max(visibleRightCount, 30), timeMs: 12 }),
    [visibleRightCount],
  )

  useEffect(() => {
    onMetrics('virtualization', 'unoptimized', badStats)
    onMetrics('virtualization', 'optimized', goodStats)
  }, [badStats, goodStats, onMetrics])

  return (
    <ComparisonPanel
      title="4) Virtualization Demo"
      description="Rendering every row causes jank; virtualized list mounts only visible rows."
      badStats={badStats}
      goodStats={goodStats}
      badPane={
        <div>
          <p className="meta">Items rendered: {LARGE_LIST.length}</p>
          <div className="virtual-box">
            {LARGE_LIST.map((item) => (
              <div key={`bad-${item.id}`} className="virtual-row">
                {item.label}
              </div>
            ))}
          </div>
        </div>
      }
      goodPane={
        <div>
          <p className="meta">Items rendered: ~{Math.max(visibleRightCount, 30)}</p>
          <div className="virtual-box">
            <List
              rowComponent={VirtualizedRow}
              rowCount={LARGE_LIST.length}
              rowHeight={30}
              rowProps={{ rows: LARGE_LIST }}
              onRowsRendered={(visibleRows) => {
                setVisibleRightCount(visibleRows.stopIndex - visibleRows.startIndex + 1)
              }}
              style={{ height: 260 }}
            />
          </div>
        </div>
      }
    />
  )
}

export default VirtualizationDemo
