import { useEffect, useRef, useState } from 'react'
import './ResumeUpload.css'

const TOAST_TIMEOUT_MS = 3200

export function ResumeUpload() {
  const timerRef = useRef(null)
  const toastTimerRef = useRef(null)
  const errorAnnounceTimerRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [errorAnnouncement, setErrorAnnouncement] = useState('')
  const [simulateError, setSimulateError] = useState(false)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
      if (errorAnnounceTimerRef.current) {
        window.clearTimeout(errorAnnounceTimerRef.current)
      }
    }
  }, [])

  const isUploadReady = Boolean(selectedFile) && !isUploading
  const isComplete = progress === 100

  const pushToast = (type, message) => {
    setToasts([{ id: Date.now(), type, message }])
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToasts([])
      toastTimerRef.current = null
    }, TOAST_TIMEOUT_MS)
  }

  const announceErrorReason = (reason) => {
    // Clear first so repeated identical failures are announced again.
    setErrorAnnouncement('')
    if (errorAnnounceTimerRef.current) {
      window.clearTimeout(errorAnnounceTimerRef.current)
    }
    errorAnnounceTimerRef.current = window.setTimeout(() => {
      setErrorAnnouncement(reason)
      errorAnnounceTimerRef.current = null
    }, 40)
  }

  const resetUploadState = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsUploading(false)
    setProgress(0)
  }

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] ?? null
    setErrorMessage('')
    setErrorAnnouncement('')
    setSelectedFile(nextFile)
    setProgress(0)
    setAnnouncement(nextFile ? `${nextFile.name} selected.` : '')
    if (nextFile) {
      pushToast('info', `${nextFile.name} selected.`)
    }
  }

  const startUpload = () => {
    if (!selectedFile || isUploading) {
      return
    }

    setErrorMessage('')
    setErrorAnnouncement('')
    setIsUploading(true)
    setProgress(0)
    setAnnouncement(`Uploading ${selectedFile.name}.`)
    pushToast('info', `Uploading ${selectedFile.name}.`)

    timerRef.current = window.setInterval(() => {
      setProgress((currentProgress) => {
        const nextProgress = Math.min(currentProgress + 20, 100)

        if (simulateError && nextProgress >= 60) {
          window.clearInterval(timerRef.current)
          timerRef.current = null
          setIsUploading(false)
          const failureReason = `Upload failed for ${selectedFile.name} due to unstable network. Please retry.`
          setErrorMessage(failureReason)
          announceErrorReason(failureReason)
          setAnnouncement(failureReason)
          pushToast('error', failureReason)
          return currentProgress
        }

        if (nextProgress === 100) {
          window.clearInterval(timerRef.current)
          timerRef.current = null
          setIsUploading(false)
          setAnnouncement(`Upload complete for ${selectedFile.name}.`)
          pushToast('success', `Upload complete for ${selectedFile.name}.`)
        } else {
          setAnnouncement(`${selectedFile.name} upload ${nextProgress}% complete.`)
        }

        return nextProgress
      })
    }, 300)
  }

  const handleRetry = () => {
    setErrorMessage('')
    setErrorAnnouncement('')
    startUpload()
  }

  return (
    <section className="resume-upload" aria-labelledby="resume-upload-title">
      <h2 id="resume-upload-title">Resume upload</h2>
      <p>Attach your resume with accessible progress, recovery guidance, and toast updates.</p>

      <label htmlFor="resume-file">Resume file</label>
      <input
        id="resume-file"
        name="resume-file"
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        disabled={isUploading}
        aria-invalid={errorMessage ? 'true' : 'false'}
        aria-describedby={errorMessage ? 'resume-upload-error-message' : undefined}
      />

      {selectedFile && <p>Selected file: {selectedFile.name}</p>}

      <label className="resume-upload__simulate-toggle" htmlFor="simulate-upload-error">
        <input
          id="simulate-upload-error"
          type="checkbox"
          checked={simulateError}
          onChange={(event) => setSimulateError(event.target.checked)}
          disabled={isUploading}
        />
        Simulate upload error (for recovery practice)
      </label>

      <div className="resume-upload__actions">
        <button type="button" onClick={startUpload} disabled={!isUploadReady}>
          {isUploading ? 'Uploading...' : 'Upload resume'}
        </button>
        {errorMessage && (
          <button type="button" onClick={handleRetry} disabled={isUploading || !selectedFile}>
            Retry upload
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setSelectedFile(null)
            setErrorMessage('')
            resetUploadState()
            setAnnouncement('Upload form reset.')
          }}
          disabled={isUploading}
        >
          Reset
        </button>
      </div>

      <div
        className="resume-upload__progress"
        role="progressbar"
        aria-label="Resume upload progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-valuetext={`${progress}% complete`}
      >
        <span style={{ width: `${progress}%` }} />
      </div>

      <p className="resume-upload__progress-text">{progress}% complete</p>
      {isUploading && (
        <div className="resume-upload__skeleton" aria-hidden="true">
          <span />
          <span />
        </div>
      )}

      {errorMessage && (
        <div className="resume-upload__error" role="alert" id="resume-upload-error-message">
          <p>{errorMessage}</p>
          <p>Try again after checking your connection or select another file.</p>
        </div>
      )}

      {isComplete && !isUploading && !errorMessage && (
        <p className="resume-upload__success">Upload complete. Ready for submission.</p>
      )}

      <div className="resume-upload__toast-region" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`resume-upload__toast resume-upload__toast--${toast.type}`}
            role={toast.type === 'error' ? 'alert' : 'status'}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
      <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="true">
        {errorAnnouncement}
      </div>
    </section>
  )
}
