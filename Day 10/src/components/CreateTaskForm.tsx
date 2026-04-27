import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createTaskLocal } from '../lib/queryOptions'
import { taskKeys } from '../lib/queryKeys'

export function CreateTaskForm() {
  const [title, setTitle] = useState('')
  const queryClient = useQueryClient()
  const m = useMutation({
    mutationFn: (t: string) => createTaskLocal({ title: t, status: 'open', assignee: null }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all() })
    },
  })
  return (
    <form
      className="create-task"
      onSubmit={(e) => {
        e.preventDefault()
        if (!title.trim() || m.isPending) {
          return
        }
        m.mutateAsync(title.trim()).then(
          () => {
            setTitle('')
          },
          () => {
            // Error surfaces via global banner + React Query
          },
        )
      }}
    >
      <label htmlFor="new-task" className="visually-hidden">
        New task title
      </label>
      <input
        id="new-task"
        className="create-task__input"
        name="title"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value)
        }}
        placeholder="New task"
        maxLength={200}
      />
      <button type="submit" className="create-task__btn" disabled={!title.trim() || m.isPending}>
        Add
      </button>
    </form>
  )
}
