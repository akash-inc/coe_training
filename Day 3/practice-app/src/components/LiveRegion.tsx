type LiveRegionProps = {
  message: string
}

export default function LiveRegion({ message }: LiveRegionProps) {
  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true" role="status">
      {message}
    </p>
  )
}
