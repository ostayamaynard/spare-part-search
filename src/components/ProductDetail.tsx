import { useEffect, useState } from 'react'
import { X, Package2, Clock, Barcode, Weight, ChevronRight } from 'lucide-react'
import ArticleImage from './ArticleImage'
import { getArticleDetail, type ArticleDetail } from '../api/euras'

interface Props {
  artnr: string | null
  onClose: () => void
}

function Skeleton() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="skeleton" style={{ height: 200 }} />
      <div className="skeleton" style={{ height: 14, width: 100 }} />
      <div className="skeleton" style={{ height: 22, width: '75%' }} />
      <div className="skeleton" style={{ height: 14, width: '50%' }} />
      <div className="skeleton" style={{ height: 14 }} />
      <div className="skeleton" style={{ height: 14 }} />
      <div className="skeleton" style={{ height: 14, width: '65%' }} />
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '8px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 110, flexShrink: 0, paddingTop: 2 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--text)', flex: 1, wordBreak: 'break-word' }}>{children}</span>
    </div>
  )
}

function Badge({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <span style={{
      fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500,
      padding: '3px 8px', borderRadius: 3,
      background: primary ? 'var(--amber)' : 'var(--bg)',
      color: primary ? '#fff' : 'var(--text-muted)',
      border: primary ? 'none' : '1px solid var(--border)',
    }}>
      {children}
    </span>
  )
}

export default function ProductDetail({ artnr, onClose }: Props) {
  const [detail, setDetail] = useState<ArticleDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!artnr) { setDetail(null); return }
    let cancelled = false
    setLoading(true)
    setError(null)
    setDetail(null)
    getArticleDetail(artnr)
      .then(d => { if (!cancelled) setDetail(d) })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [artnr])

  const isOpen = !!artnr

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 30,
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 200ms',
        }}
      />

      {/* Panel */}
      <aside
        className={`detail-panel${isOpen ? ' open' : ''}`}
        aria-label="Article detail"
        style={{
          position: 'fixed', top: 0, right: 0, zIndex: 40,
          height: '100%', width: '100%', maxWidth: 440,
          background: 'var(--surface)',
          borderLeft: `4px solid ${isOpen ? 'var(--amber)' : 'transparent'}`,
          boxShadow: '0 0 40px rgba(0,0,0,0.15)',
          overflowY: 'auto',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Article Detail
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              display: 'flex', padding: 6, borderRadius: 4,
              color: 'var(--text-muted)', transition: 'color 120ms, background 120ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {loading && <Skeleton />}

        {error && (
          <div style={{ padding: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--destructive)', marginBottom: 6 }}>Could not load details</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {error.toLowerCase().includes('test mode')
                ? 'This article is not available in the test account. The Euras EED test account only supports a limited set of article numbers for detail lookup. With a production account, all articles return full details.'
                : error}
            </p>
          </div>
        )}

        {detail && !loading && (
          <div>
            {/* Image */}
            <div style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', aspectRatio: '16/9' }}>
              <ArticleImage
                artnr={detail.artikelnummer}
                hasImage={detail.bild === 'J'}
                thumbnailUrl={detail.thumbnailurl}
                alt={detail.artikelbezeichnung}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Article number */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                  {detail.artikelnummer}
                </span>
                {detail.originalnummer && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                    OEM: {detail.originalnummer}
                  </span>
                )}
              </div>

              {/* Name */}
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>
                {detail.artikelbezeichnung}
              </h2>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 700, color: 'var(--amber)' }}>
                  {detail.ekpreis ? `€${detail.ekpreis}` : '—'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>incl. VAT</span>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <Badge primary={detail.bestellbar === 'J'}>
                  {detail.bestellbar === 'J' ? 'ORDERABLE' : 'NOT ORDERABLE'}
                </Badge>
                {Array.isArray(detail.artikelmerkmal) && detail.artikelmerkmal.map((m, i) => (
                  <Badge key={i}>
                    {m === 'O' ? 'ORIGINAL' : m === 'Q' ? 'OEM QUALITY' : m === 'A' ? 'ALTERNATIVE' : m}
                  </Badge>
                ))}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

              {/* Info rows */}
              <div>
                {detail.artikelhersteller && (
                  <Row label="Manufacturer">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Package2 size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      {detail.artikelhersteller}
                    </span>
                  </Row>
                )}
                {detail.lieferzeit && (
                  <Row label="Delivery time">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      {detail.lieferzeit}
                    </span>
                  </Row>
                )}
                {detail.gewicht && (
                  <Row label="Weight">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Weight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      {detail.gewicht} g
                    </span>
                  </Row>
                )}
                {detail.EAN && (
                  <Row label="EAN">
                    <span style={{ fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Barcode size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      {detail.EAN}
                    </span>
                  </Row>
                )}
                {detail.vgruppenname && <Row label="Category">{detail.vgruppenname}</Row>}
              </div>

              {detail.artikeltext && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                  <div>
                    <h4 style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Description</h4>
                    <p style={{ fontSize: 13, lineHeight: 1.65 }}>{detail.artikeltext}</p>
                  </div>
                </>
              )}

              {detail.technischedaten && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                  <div>
                    <h4 style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Technical Data</h4>
                    <p style={{ fontSize: 13, lineHeight: 1.65, fontFamily: 'var(--font-mono)' }}>{detail.technischedaten}</p>
                  </div>
                </>
              )}

              {Array.isArray(detail.vgruppenbaum) && detail.vgruppenbaum.length > 0 && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                  <div>
                    <h4 style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Category Path</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                      {detail.vgruppenbaum.map((g, i) => (
                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {i > 0 && <ChevronRight size={12} />}
                          {g.vgruppenname}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
