import "./Column.css"

export default function Column({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <section className="board-column" role="region" aria-label={`${name} column`}>
      <h2 className="column-title">{name}</h2>
      <div className="column-content">{children}</div>
    </section>
  )
}