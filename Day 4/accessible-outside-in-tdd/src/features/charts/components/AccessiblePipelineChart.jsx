import { useId, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './AccessiblePipelineChart.css'

export function AccessiblePipelineChart({ title, description, data }) {
  const titleId = useId()
  const [isTableVisible, setIsTableVisible] = useState(false)
  const hasData = data.length > 0
  const toggleLabel = isTableVisible ? 'Hide data table' : 'View data as table'

  const handleToggleTable = () => {
    setIsTableVisible((currentState) => !currentState)
  }

  return (
    <section className="pipeline-chart" aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      <p>{description}</p>

      {!hasData && <p>No pipeline data available yet.</p>}

      {hasData && (
        <>
          <div
            className="pipeline-chart__visual"
            role="img"
            aria-label="Bar chart showing applications by pipeline stage"
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data} aria-hidden="true">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <button type="button" onClick={handleToggleTable}>
            {toggleLabel}
          </button>

          {isTableVisible && (
            <table className="pipeline-chart__table" aria-label="Pipeline data table">
              <thead>
                <tr>
                  <th scope="col">Stage</th>
                  <th scope="col">Applications</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.stage}>
                    <td>{row.stage}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
  )
}
