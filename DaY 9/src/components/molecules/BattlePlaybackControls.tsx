export type BattlePlaybackControlsProps = {
  playhead: number
  turnLen: number
  onToStart: () => void
  onStep: (delta: -1 | 1) => void
  onToEnd: () => void
  onPlayheadChange: (n: number) => void
  /** Label above controls (e.g. “After turn 3 of 10”). */
  positionLabel: string
}

export function BattlePlaybackControls({
  playhead,
  turnLen,
  onToStart,
  onStep,
  onToEnd,
  onPlayheadChange,
  positionLabel,
}: BattlePlaybackControlsProps) {
  return (
    <div className="min-w-0">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 text-xs font-medium text-foreground">Turn timeline</p>
        <span className="text-[10px] text-muted-foreground">{positionLabel}</span>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-1">
        <button
          type="button"
          className="rounded border border-border bg-card px-2 py-0.5 text-xs"
          onClick={onToStart}
          disabled={playhead === 0}
        >
          |◀
        </button>
        <button
          type="button"
          className="rounded border border-border bg-card px-2 py-0.5 text-xs"
          onClick={() => onStep(-1)}
          disabled={playhead === 0}
        >
          Previous
        </button>
        <button
          type="button"
          className="rounded border border-border bg-card px-2 py-0.5 text-xs"
          onClick={() => onStep(1)}
          disabled={playhead >= turnLen}
        >
          Next
        </button>
        <button
          type="button"
          className="rounded border border-border bg-card px-2 py-0.5 text-xs"
          onClick={onToEnd}
          disabled={playhead === turnLen}
        >
          ▶|
        </button>
      </div>
      <input
        type="range"
        className="mb-2 w-full"
        min={0}
        max={turnLen}
        value={playhead}
        onChange={(e) => onPlayheadChange(Number(e.target.value))}
        aria-label="Scrub through battle turns"
      />
    </div>
  )
}
