import { useState, useEffect } from 'react'
import IdeaCard from './components/IdeaCard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000'

export default function App() {
  const [ideas, setIdeas] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [upvotedIds, setUpvotedIds] = useState(() => new Set())
  const [sortBy, setSortBy] = useState('chronological')

  useEffect(() => {
    const stored = window.localStorage.getItem('ideaWallUpvoted')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setUpvotedIds(new Set(parsed))
        }
      } catch (e) {
        console.error('Failed to parse stored upvotes', e)
      }
    }

    const fetchIdeas = (isInitial = false) => {
      if (isInitial) {
        setLoading(true)
      }

      fetch(`${API_URL}/ideas`)
        .then((res) => res.json())
        .then((data) => {
          setIdeas(data)
          setError(null)
        })
        .catch((err) => {
          setError('Failed to load ideas')
          console.error(err)
        })
        .finally(() => {
          if (isInitial) {
            setLoading(false)
          }
        })
    }

    fetchIdeas(true)
    const intervalId = setInterval(() => fetchIdeas(false), 5000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || submitting) return

    setSubmitting(true)
    fetch(`${API_URL}/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: trimmed }),
    })
      .then((res) => res.json())
      .then((newIdea) => {
        setIdeas((prev) => [newIdea, ...prev])
        setContent('')
        setError(null)
      })
      .catch((err) => {
        setError('Failed to submit idea')
        console.error(err)
      })
      .finally(() => setSubmitting(false))
  }

  const handleUpvote = (id) => {
    const alreadyUpvoted = upvotedIds.has(id)

    if (alreadyUpvoted) {
      // Optimistic remove
      setUpvotedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        window.localStorage.setItem('ideaWallUpvoted', JSON.stringify([...next]))
        return next
      })

      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === id
            ? { ...idea, upvotes: Math.max((idea.upvotes || 0) - 1, 0) }
            : idea
        )
      )

      fetch(`${API_URL}/ideas/${id}/remove-upvote`, {
        method: 'POST',
      }).catch((err) => {
        console.error('Failed to remove upvote', err)
        // Revert optimistic change
        setIdeas((prev) =>
          prev.map((idea) =>
            idea.id === id ? { ...idea, upvotes: (idea.upvotes || 0) + 1 } : idea
          )
        )
        setUpvotedIds((prev) => {
          const next = new Set(prev)
          next.add(id)
          window.localStorage.setItem('ideaWallUpvoted', JSON.stringify([...next]))
          return next
        })
      })

      return
    }

    // Optimistic add
    setUpvotedIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      window.localStorage.setItem('ideaWallUpvoted', JSON.stringify([...next]))
      return next
    })

    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id ? { ...idea, upvotes: (idea.upvotes || 0) + 1 } : idea
      )
    )

    fetch(`${API_URL}/ideas/${id}/upvote`, {
      method: 'POST',
    }).catch((err) => {
      console.error('Failed to upvote', err)
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === id ? { ...idea, upvotes: Math.max((idea.upvotes || 1) - 1, 0) } : idea
        )
      )
      setUpvotedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        window.localStorage.setItem('ideaWallUpvoted', JSON.stringify([...next]))
        return next
      })
    })
  }

  const sortedIdeas = [...ideas].sort((a, b) => {
    if (sortBy === 'upvotes') {
      const aVotes = a.upvotes || 0
      const bVotes = b.upvotes || 0
      if (bVotes !== aVotes) return bVotes - aVotes
      // Tie-breaker: newest first
      return new Date(b.created_at) - new Date(a.created_at)
    }

    // Default: chronological (newest first)
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-slate-800">
          Anonymous Idea Wall
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mb-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <label htmlFor="idea" className="mb-2 block text-sm font-medium text-slate-700">
            Share an idea
          </label>
          <textarea
            id="idea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your idea here..."
            rows={3}
            className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="rounded-lg bg-slate-800 px-5 py-2.5 font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post idea'}
          </button>
        </form>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
        )}

        {loading ? (
          <p className="text-slate-500">Loading ideas...</p>
        ) : ideas.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No ideas yet. Be the first to share!
          </p>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium text-slate-500">Sort by</span>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setSortBy('chronological')}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    sortBy === 'chronological'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Chronological
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('upvotes')}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    sortBy === 'upvotes'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Most upvotes
                </button>
              </div>
            </div>

            <ul className="flex flex-col gap-4">
              {sortedIdeas.map((idea) => (
                <li key={idea.id}>
                  <IdeaCard
                    idea={idea}
                    hasUpvoted={upvotedIds.has(idea.id)}
                    onUpvote={() => handleUpvote(idea.id)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
