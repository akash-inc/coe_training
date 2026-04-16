import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResumeUpload } from '../components/ResumeUpload'

describe('ResumeUpload', () => {
  it('renders labeled upload controls', () => {
    render(<ResumeUpload />)

    expect(screen.getByRole('heading', { name: 'Resume upload' })).toBeInTheDocument()
    expect(screen.getByLabelText('Resume file')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload resume' })).toBeDisabled()
  })

  it('shows selected filename and enables upload button', async () => {
    const user = userEvent.setup()
    render(<ResumeUpload />)

    const file = new File(['resume-content'], 'resume.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText('Resume file'), file)

    expect(screen.getByText('Selected file: resume.pdf')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload resume' })).toBeEnabled()
  })

  it('updates progress to completion and announces finish', async () => {
    const user = userEvent.setup()
    render(<ResumeUpload />)

    const file = new File(['resume-content'], 'resume.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText('Resume file'), file)
    await user.click(screen.getByRole('button', { name: 'Upload resume' }))

    await waitFor(
      () => {
        expect(
          screen.getByRole('progressbar', { name: 'Resume upload progress' }),
        ).toHaveAttribute('aria-valuenow', '100')
      },
      { timeout: 2500 },
    )
    expect(screen.getByText('100% complete')).toBeInTheDocument()
    expect(screen.getByText('Upload complete. Ready for submission.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Upload complete for resume.pdf.')
  })
})
