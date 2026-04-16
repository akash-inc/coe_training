import { useEffect, useRef, useState } from 'react'
import './ResumeUpload.css'

export function ResumeUpload() {
  const timerRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
    }
  }, [])

  const isUploadReady = Boolean(selectedFile) && !isUploading
  const isComplete = progress === 100

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] ?? null
    setSelectedFile(nextFile)
    setProgress(0)
    setAnnouncement(nextFile ? `${nextFile.name} selected.` : '')
  }

  const handleUpload = () => {
    if (!selectedFile || isUploading) {
      return
    }

    setIsUploading(true)
    setProgress(0)
    setAnnouncement(`Uploading ${selectedFile.name}.`)

    timerRef.current = window.setInterval(() => {
      setProgress((currentProgress) => {
        const nextProgress = Math.min(currentProgress + 20, 100)

        if (nextProgress === 100) {
          window.clearInterval(timerRef.current)
          timerRef.current = null
          setIsUploading(false)
          setAnnouncement(`Upload complete for ${selectedFile.name}.`)
        } else {
          setAnnouncement(`${selectedFile.name} upload ${nextProgress}% complete.`)
        }

        return nextProgress
      })
    }, 300)
  }

  return (
    <section className="resume-upload" aria-labelledby="resume-upload-title">
      <h2 id="resume-upload-title">Resume upload</h2>
      <p>Attach your resume with progress updates and screen-reader announcements.</p>

      <label htmlFor="resume-file">Resume file</label>
      <input
        id="resume-file"
        name="resume-file"
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
      />

      {selectedFile && <p>Selected file: {selectedFile.name}</p>}

      <button type="button" onClick={handleUpload} disabled={!isUploadReady}>
        {isUploading ? 'Uploading...' : 'Upload resume'}
      </button>

      <div
        className="resume-upload__progress"
        role="progressbar"
        aria-label="Resume upload progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span style={{ width: `${progress}%` }} />
      </div>

      <p>{progress}% complete</p>
      {isComplete && !isUploading && <p>Upload complete. Ready for submission.</p>}

      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </section>
  )
}
