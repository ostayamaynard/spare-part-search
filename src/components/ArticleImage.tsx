import { useState } from 'react'
import { Package } from 'lucide-react'

interface Props {
  artnr: string
  hasImage: boolean
  thumbnailUrl?: string
  alt?: string
  style?: React.CSSProperties
}

// Shows the product thumbnail if available, otherwise a grid-patterned placeholder
export default function ArticleImage({ artnr, hasImage, thumbnailUrl, alt, style }: Props) {
  const [failed, setFailed] = useState(false)

  const showPlaceholder = !hasImage || !thumbnailUrl || failed

  if (showPlaceholder) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0ede8',
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 19px, #e2e0db 19px, #e2e0db 20px),
            repeating-linear-gradient(90deg, transparent, transparent 19px, #e2e0db 19px, #e2e0db 20px)
          `,
          color: 'var(--text-muted)',
          userSelect: 'none',
          ...style,
        }}
      >
        <Package size={28} style={{ opacity: 0.25, marginBottom: 4 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.35, overflow: 'hidden', maxWidth: '90%', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {artnr}
        </span>
      </div>
    )
  }

  return (
    <img
      src={thumbnailUrl}
      alt={alt || artnr}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      style={{ objectFit: 'contain', ...style }}
    />
  )
}
