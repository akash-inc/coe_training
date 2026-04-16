import { useMemo, useState } from 'react'
import './ApplicationBoard.css'

const COLUMN_ORDER = ['saved', 'applied', 'interview']

const COLUMN_LABELS = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
}

const INITIAL_BOARD = {
  saved: [
    { id: 'job-1', title: 'Frontend Engineer', company: 'Acme Labs' },
    { id: 'job-2', title: 'Accessibility Specialist', company: 'Inclusive Co' },
  ],
  applied: [{ id: 'job-3', title: 'React Developer', company: 'Northstar' }],
  interview: [{ id: 'job-4', title: 'UI Engineer', company: 'BrightTech' }],
}

function getCardLabel(card) {
  return `${card.title} at ${card.company}`
}

function cloneBoard(board) {
  return {
    saved: [...board.saved],
    applied: [...board.applied],
    interview: [...board.interview],
  }
}

function moveWithinColumn(board, columnId, index, direction) {
  const column = board[columnId]
  const targetIndex = index + direction

  if (targetIndex < 0 || targetIndex >= column.length) {
    return null
  }

  const nextBoard = cloneBoard(board)
  const [card] = nextBoard[columnId].splice(index, 1)
  nextBoard[columnId].splice(targetIndex, 0, card)
  return nextBoard
}

function moveAcrossColumns(board, columnId, index, direction) {
  const columnIndex = COLUMN_ORDER.indexOf(columnId)
  const targetColumnIndex = columnIndex + direction

  if (targetColumnIndex < 0 || targetColumnIndex >= COLUMN_ORDER.length) {
    return null
  }

  const targetColumnId = COLUMN_ORDER[targetColumnIndex]
  const nextBoard = cloneBoard(board)
  const [card] = nextBoard[columnId].splice(index, 1)
  nextBoard[targetColumnId].push(card)
  return { nextBoard, targetColumnId }
}

export function ApplicationBoard() {
  const [board, setBoard] = useState(INITIAL_BOARD)
  const [announcement, setAnnouncement] = useState('')
  const [openCardId, setOpenCardId] = useState(null)

  const totalCount = useMemo(
    () => COLUMN_ORDER.reduce((count, columnId) => count + board[columnId].length, 0),
    [board],
  )

  const moveCard = (columnId, index, action) => {
    const card = board[columnId][index]
    if (!card) {
      return
    }

    if (action === 'up' || action === 'down') {
      const direction = action === 'up' ? -1 : 1
      const nextBoard = moveWithinColumn(board, columnId, index, direction)
      if (!nextBoard) {
        return
      }
      setBoard(nextBoard)
      setAnnouncement(`${getCardLabel(card)} moved ${action} in ${COLUMN_LABELS[columnId]}.`)
      setOpenCardId(null)
      return
    }

    const direction = action === 'next' ? 1 : -1
    const result = moveAcrossColumns(board, columnId, index, direction)
    if (!result) {
      return
    }

    setBoard(result.nextBoard)
    setAnnouncement(
      `${getCardLabel(card)} moved to ${COLUMN_LABELS[result.targetColumnId]} column.`,
    )
    setOpenCardId(null)
  }

  return (
    <section className="application-board" aria-labelledby="application-board-title">
      <h2 id="application-board-title">Application board</h2>
      <p className="application-board__summary">
        {totalCount} tracked applications across pipeline stages.
      </p>
      <ul className="application-board__instructions">
        <li>Use move controls to reorder items within each stage.</li>
        <li>Choose from available move options in each card menu.</li>
      </ul>

      <div className="application-board__columns">
        {COLUMN_ORDER.map((columnId, columnPosition) => (
          <section
            key={columnId}
            className="application-board__column"
            aria-labelledby={`${columnId}-title`}
          >
            <h3 id={`${columnId}-title`}>{COLUMN_LABELS[columnId]}</h3>
            <ul className="application-board__list">
              {board[columnId].map((card, index) => {
                const cardLabel = getCardLabel(card)
                const isFirst = index === 0
                const isLast = index === board[columnId].length - 1
                const isFirstColumn = columnPosition === 0
                const isLastColumn = columnPosition === COLUMN_ORDER.length - 1
                const availableMoves = [
                  !isFirst && { id: 'up', label: 'Move up' },
                  !isLast && { id: 'down', label: 'Move down' },
                  !isFirstColumn && {
                    id: 'previous',
                    label: `Move to ${COLUMN_LABELS[COLUMN_ORDER[columnPosition - 1]]}`,
                  },
                  !isLastColumn && {
                    id: 'next',
                    label: `Move to ${COLUMN_LABELS[COLUMN_ORDER[columnPosition + 1]]}`,
                  },
                ].filter(Boolean)
                const isMenuOpen = openCardId === card.id
                const menuId = `${card.id}-move-options`

                return (
                  <li key={card.id} className="application-board__card">
                    <div className="application-board__card-header">
                      <h4>{card.title}</h4>
                      <div className="application-board__actions">
                        <button
                          type="button"
                          className="application-board__move-button"
                          aria-label={`Move options for ${cardLabel}`}
                          aria-expanded={isMenuOpen}
                          aria-controls={menuId}
                          onClick={() =>
                            setOpenCardId((currentOpenId) =>
                              currentOpenId === card.id ? null : card.id,
                            )
                          }
                        >
                          Move
                        </button>
                        {isMenuOpen && (
                          <ul
                            id={menuId}
                            className="application-board__menu"
                            role="listbox"
                            aria-label={`Move options for ${cardLabel}`}
                          >
                            {availableMoves.map((move) => (
                              <li key={move.id}>
                                <button
                                  type="button"
                                  className="application-board__menu-item"
                                  onClick={() => moveCard(columnId, index, move.id)}
                                >
                                  {move.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <p className="application-board__company">{card.company}</p>
                    <p className="application-board__description">
                      Application card. Use controls to move this job through the pipeline.
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>

      <div className="application-board__status sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </section>
  )
}
