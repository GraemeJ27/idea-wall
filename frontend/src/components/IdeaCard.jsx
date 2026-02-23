export default function IdeaCard({ idea, hasUpvoted, onUpvote }) {
  const date = new Date(idea.created_at).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-slate-800 leading-relaxed">{idea.content}</p>
      <div className="mt-3 flex items-center justify-between">
        <time className="block text-sm text-slate-500" dateTime={idea.created_at}>
          {date}
        </time>
        <button
          type="button"
          onClick={onUpvote}
          disabled={hasUpvoted}
          aria-pressed={hasUpvoted}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`h-4 w-4 ${
              hasUpvoted ? 'fill-slate-500 text-slate-500' : 'fill-transparent text-slate-500'
            }`}
          >
            <path
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3m0 11V8.5A2.5 2.5 0 0 1 9.5 6l3.6-4.2A1 1 0 0 1 15 2v4h4.3a2.7 2.7 0 0 1 2.7 3l-1 7A3 3 0 0 1 18 19h-5.3a2 2 0 0 0-1.4.6L10 21.1A1.8 1.8 0 0 1 8.7 22H7Z"
            />
          </svg>
          <span>{idea.upvotes ?? 0}</span>
        </button>
      </div>
    </article>
  )
}
