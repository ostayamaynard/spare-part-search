import { useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  loading?: boolean
  placeholder?: string
}

export default function SearchBar({ value, onChange, loading = false, placeholder = 'Search spare parts, article numbers, manufacturers…' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        transition: 'border-color 150ms, box-shadow 150ms',
      }}
      onFocusCapture={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'var(--amber)'
        el.style.boxShadow = '0 0 0 3px rgba(224,123,57,0.15)'
      }}
      onBlurCapture={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'var(--border)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Icon */}
      <span style={{ position: 'absolute', left: 16, color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none' }}>
        {loading
          ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--amber)' }} />
          : <Search size={20} />
        }
      </span>

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search articles"
        autoComplete="off"
        spellCheck={false}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          padding: '14px 40px 14px 48px',
          fontSize: 16,
          color: 'var(--text)',
        }}
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={() => { onChange(''); inputRef.current?.focus() }}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: 14,
            color: 'var(--text-muted)',
            display: 'flex',
            padding: 4,
            borderRadius: 4,
            transition: 'color 120ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <X size={16} />
        </button>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type="search"]::-webkit-search-cancel-button { display: none; }
      `}</style>
    </div>
  )
}
