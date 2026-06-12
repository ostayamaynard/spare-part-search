import { Clock, Package2 } from 'lucide-react'
import ArticleImage from './ArticleImage'
import type { ArticleHit } from '../api/euras'

interface Props {
  article: ArticleHit
  selected?: boolean
  onClick: () => void
}

export default function ProductCard({ article, selected = false, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`product-card${selected ? ' selected' : ''}`}
      style={{
        width: '100%',
        textAlign: 'left',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden' }}>
        <ArticleImage
          artnr={article.artikelnummer}
          hasImage={article.bild === 'J'}
          thumbnailUrl={article.thumbnailurl}
          alt={article.artikelbezeichnung}
          style={{ width: '100%', height: '100%' }}
        />
        {article.bestellbar === 'J' && (
          <span style={{
            position: 'absolute', top: 8, right: 8,
            fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 500,
            background: 'var(--amber)', color: '#fff',
            padding: '2px 6px', borderRadius: 3,
          }}>
            IN STOCK
          </span>
        )}
      </div>

      {/* Text */}
      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
          {article.artikelnummer}
        </span>

        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
          lineHeight: 1.35, color: 'var(--text)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.artikelbezeichnung}
        </h3>

        {article.artikelhersteller && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Package2 size={12} style={{ flexShrink: 0 }} />
            {article.artikelhersteller}
          </span>
        )}

        {/* Price + delivery */}
        <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--amber)' }}>
            {article.ekpreis ? `€${article.ekpreis}` : '—'}
          </span>
          {article.lieferzeit && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, textAlign: 'right', lineHeight: 1.3 }}>
              <Clock size={11} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {article.lieferzeit}
              </span>
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
