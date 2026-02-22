export default function IdeaCard({ idea }) {
  const date = new Date(idea.created_at).toLocaleDateString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-slate-800 leading-relaxed">{idea.content}</p>
      <time className="mt-3 block text-sm text-slate-500" dateTime={idea.created_at}>
        {date}
      </time>
    </article>
  )
}
