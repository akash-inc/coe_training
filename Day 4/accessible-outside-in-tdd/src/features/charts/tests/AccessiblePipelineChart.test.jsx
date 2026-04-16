import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccessiblePipelineChart } from '../components/AccessiblePipelineChart'

const pipelineData = [
  { stage: 'Saved', count: 12 },
  { stage: 'Applied', count: 8 },
  { stage: 'Interview', count: 3 },
  { stage: 'Offer', count: 1 },
]

describe('AccessiblePipelineChart', () => {
  it('renders heading, description, and a labeled chart region', () => {
    render(
      <AccessiblePipelineChart
        title="Application pipeline"
        description="Most applications are in Saved and Applied stages."
        data={pipelineData}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Application pipeline' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Most applications are in Saved and Applied stages.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: 'Bar chart showing applications by pipeline stage',
      }),
    ).toBeInTheDocument()
  })

  it('toggles table fallback from the button using click', async () => {
    const user = userEvent.setup()

    render(
      <AccessiblePipelineChart
        title="Application pipeline"
        description="Most applications are in Saved and Applied stages."
        data={pipelineData}
      />,
    )

    const toggleButton = screen.getByRole('button', { name: 'View data as table' })
    expect(screen.queryByRole('table', { name: 'Pipeline data table' })).not.toBeInTheDocument()

    await user.click(toggleButton)

    expect(screen.getByRole('table', { name: 'Pipeline data table' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide data table' })).toBeInTheDocument()
  })

  it('toggles table fallback using keyboard interaction', async () => {
    const user = userEvent.setup()

    render(
      <AccessiblePipelineChart
        title="Application pipeline"
        description="Most applications are in Saved and Applied stages."
        data={pipelineData}
      />,
    )

    const toggleButton = screen.getByRole('button', { name: 'View data as table' })
    toggleButton.focus()

    await user.keyboard('{Enter}')
    expect(screen.getByRole('table', { name: 'Pipeline data table' })).toBeInTheDocument()

    await user.keyboard(' ')
    expect(screen.queryByRole('table', { name: 'Pipeline data table' })).not.toBeInTheDocument()
  })

  it('renders table rows with the same values as the chart dataset', async () => {
    const user = userEvent.setup()

    render(
      <AccessiblePipelineChart
        title="Application pipeline"
        description="Most applications are in Saved and Applied stages."
        data={pipelineData}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'View data as table' }))

    const table = screen.getByRole('table', { name: 'Pipeline data table' })
    expect(table).toBeInTheDocument()

    for (const row of pipelineData) {
      expect(screen.getByRole('cell', { name: row.stage })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: String(row.count) })).toBeInTheDocument()
    }
  })

  it('renders an empty-state message and no chart when dataset is empty', () => {
    render(
      <AccessiblePipelineChart
        title="Application pipeline"
        description="No jobs tracked yet."
        data={[]}
      />,
    )

    expect(screen.getByText('No pipeline data available yet.')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View data as table' })).not.toBeInTheDocument()
  })
})
