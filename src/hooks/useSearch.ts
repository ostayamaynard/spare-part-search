import { useCallback, useEffect, useRef, useState } from 'react'
import { searchArticles, type ArticleHit } from '../api/euras'

const DEBOUNCE_MS = 400
const PER_PAGE = 24

interface SearchState {
  results: ArticleHit[]
  totalHits: number
  currentPage: number
  totalPages: number
  loading: boolean
  error: string | null
}

interface UseSearchReturn extends SearchState {
  query: string
  setQuery: (q: string) => void
  goToPage: (page: number) => void
}

export function useSearch(): UseSearchReturn {
  const [query, setQueryRaw] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [state, setState] = useState<SearchState>({
    results: [],
    totalHits: 0,
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null,
  })

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestQuery = useRef('')
  const latestPage = useRef(1)

  // Run the actual search
  const runSearch = useCallback(async (q: string, page: number) => {
    if (!q.trim()) {
      setState({ results: [], totalHits: 0, currentPage: 1, totalPages: 1, loading: false, error: null })
      return
    }
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const data = await searchArticles(q.trim(), page, PER_PAGE)
      // Ignore stale responses
      if (latestQuery.current !== q || latestPage.current !== page) return
      setState({
        results: data.treffer,
        totalHits: data.gesamtanzahltreffer,
        currentPage: data.seite,
        totalPages: data.anzahlseiten,
        loading: false,
        error: null,
      })
    } catch (err) {
      if (latestQuery.current !== q) return
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Search failed',
        results: [],
      }))
    }
  }, [])

  // Debounce query changes
  const setQuery = useCallback((q: string) => {
    setQueryRaw(q)
    latestQuery.current = q
    latestPage.current = 1
    if (timer.current) clearTimeout(timer.current)
    if (!q.trim()) {
      setDebouncedQuery('')
      setCurrentPage(1)
      setState({ results: [], totalHits: 0, currentPage: 1, totalPages: 1, loading: false, error: null })
      return
    }
    setState(prev => ({ ...prev, loading: true, error: null }))
    timer.current = setTimeout(() => {
      setDebouncedQuery(q)
      setCurrentPage(1)
    }, DEBOUNCE_MS)
  }, [])

  const goToPage = useCallback((page: number) => {
    latestPage.current = page
    setCurrentPage(page)
    runSearch(latestQuery.current, page)
  }, [runSearch])

  // Fire search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) runSearch(debouncedQuery, 1)
  }, [debouncedQuery, runSearch])

  // Cleanup timer on unmount
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  return { ...state, query, setQuery, goToPage, currentPage }
}
