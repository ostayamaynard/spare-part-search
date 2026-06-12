import { useEffect, useState } from 'react'
import { Search, Wrench, Zap, PackageSearch, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import ProductCard from '../components/ProductCard'
import ProductDetail from '../components/ProductDetail'
import { useSearch } from '../hooks/useSearch'
import { warmSession } from '../api/euras'

// The public DE test account only allows these search keywords.
// A production account has no such restriction.
const DEMO_QUERIES = ['SONY', 'AEG', 'HDMI']

export default function SearchPage() {
  const { results, totalHits, currentPage, totalPages, loading, error, query, setQuery, goToPage } = useSearch()
  const [selectedArtnr, setSelectedArtnr] = useState<string | null>(null)

  // Pre-warm the EED session as soon as the page loads
  useEffect(() => { warmSession().catch(() => {}) }, [])

  const hasResults = results.length > 0
  const showEmpty = !loading && !error && query.trim() && !hasResults
  const showHint = !query.trim()

  function handleCardClick(artnr: string) {
    setSelectedArtnr(prev => (prev === artnr ? null : artnr))
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside style={{
        display: 'none',
        width: 240,
        flexShrink: 0,
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        background: 'var(--sidebar-bg)',
        color: 'var(--sidebar-text)',
      }} className="sidebar">

        {/* Brand */}
        <div style={{ padding: '32px 24px 24px', borderBottom: '1px solid var(--sidebar-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Wrench size={18} style={{ color: 'var(--amber)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>
              ersatzteilstore24
            </span>
          </div>
          <p style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>Spare Parts Search</p>
        </div>

        {/* How to use */}
        <div style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4, marginBottom: 14 }}>
            How to use
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: Search, text: 'Type a keyword to search spare parts in real time' },
              { icon: Zap, text: 'Click any card to view full article details' },
              { icon: PackageSearch, text: 'Results powered by the Euras EED API' },
            ].map(({ icon: Icon, text }, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <Icon size={13} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, opacity: 0.65, lineHeight: 1.5 }}>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick searches */}
        <div style={{ padding: '4px 24px 20px' }}>
          <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4, marginBottom: 12 }}>
            Try searching
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {DEMO_QUERIES.map(q => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                style={{
                  fontSize: 11, fontFamily: 'var(--font-mono)',
                  padding: '4px 8px', borderRadius: 3,
                  border: '1px solid var(--sidebar-border)',
                  color: 'var(--sidebar-text)',
                  opacity: 0.65,
                  transition: 'border-color 150ms, color 150ms, opacity 150ms',
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget
                  b.style.borderColor = 'var(--amber)'
                  b.style.color = 'var(--amber)'
                  b.style.opacity = '1'
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget
                  b.style.borderColor = 'var(--sidebar-border)'
                  b.style.color = 'var(--sidebar-text)'
                  b.style.opacity = '0.65'
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto', padding: '20px 24px', fontSize: 10, opacity: 0.3, lineHeight: 1.6 }}>
          Euras EED API · DE test account<br />
          Test mode: SONY · AEG · HDMI
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Sticky search header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
        }}>
          {/* Mobile branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }} className="mobile-brand">
            <Wrench size={16} style={{ color: 'var(--amber)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>
              ersatzteilstore24 — Spare Parts Search
            </span>
          </div>

          <SearchBar value={query} onChange={setQuery} loading={loading} />

          {hasResults && (
            <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {totalHits.toLocaleString()} result{totalHits !== 1 ? 's' : ''} for{' '}
              <span style={{ color: 'var(--amber)' }}>"{query}"</span>
              {totalPages > 1 && ` — page ${currentPage} of ${totalPages}`}
            </p>
          )}
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px' }}>

          {/* Hint state */}
          {showHint && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 16, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 4, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={28} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
                  Search for spare parts
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 340 }}>
                  Enter a keyword to find spare parts. This demo uses the Euras EED test account — try <strong>SONY</strong>, <strong>AEG</strong>, or <strong>HDMI</strong>.
                </p>
              </div>
              {/* Mobile quick searches */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }} className="mobile-queries">
                {DEMO_QUERIES.map(q => (
                  <button
                    key={q}
                    onClick={() => setQuery(q)}
                    style={{
                      fontSize: 12, fontFamily: 'var(--font-mono)',
                      padding: '6px 12px', borderRadius: 4,
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                      transition: 'border-color 150ms, color 150ms',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--amber)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--amber)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: 16, borderRadius: 4,
              border: '1px solid rgba(220,38,38,0.25)',
              background: 'var(--destructive-bg)',
              maxWidth: 520,
            }}>
              <AlertCircle size={16} style={{ color: 'var(--destructive)', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--destructive)' }}>Search failed</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{error}</p>
              </div>
            </div>
          )}

          {/* Empty */}
          {showEmpty && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 12, textAlign: 'center' }}>
              <PackageSearch size={40} style={{ color: 'var(--text-muted)' }} />
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16 }}>No results found</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Try a different keyword or check the spelling.</p>
              </div>
            </div>
          )}

          {/* Skeleton grid */}
          {loading && results.length === 0 && (
            <div style={gridStyle}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ aspectRatio: '1/1' }} />
                  <div className="skeleton" style={{ height: 12, width: 60 }} />
                  <div className="skeleton" style={{ height: 16 }} />
                  <div className="skeleton" style={{ height: 12, width: '75%' }} />
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {hasResults && (
            <div style={gridStyle}>
              {results.map(article => (
                <ProductCard
                  key={article.artikelnummer}
                  article={article}
                  selected={selectedArtnr === article.artikelnummer}
                  onClick={() => handleCardClick(article.artikelnummer)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 32 }}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                style={paginationBtnStyle(currentPage <= 1 || loading)}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                style={paginationBtnStyle(currentPage >= totalPages || loading)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Detail panel ─────────────────────────────────────────── */}
      <ProductDetail artnr={selectedArtnr} onClose={() => setSelectedArtnr(null)} />

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 1024px) {
          .sidebar { display: flex !important; }
          .mobile-brand { display: none !important; }
          .mobile-queries { display: none !important; }
        }
      `}</style>
    </div>
  )
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: 16,
}

function paginationBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '7px 14px', borderRadius: 4,
    border: '1px solid var(--border)',
    fontSize: 13, color: disabled ? 'var(--text-muted)' : 'var(--text)',
    background: 'var(--surface)',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'border-color 150ms',
  }
}
