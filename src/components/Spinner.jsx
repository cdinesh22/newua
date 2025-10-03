export default function Spinner({ size = 24, className = '' }) {
  const stroke = 4
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className={`inline-flex items-center justify-center ${className}`} role="status" aria-label="loading">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="animate-spin text-saffron-600"
      >
        <circle
          cx={size/2}
          cy={size/2}
          r={r}
          strokeWidth={stroke}
          className="opacity-20"
          stroke="currentColor"
          fill="none"
        />
        <circle
          cx={size/2}
          cy={size/2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * 0.75}
          strokeLinecap="round"
          className="opacity-90"
          stroke="currentColor"
          fill="none"
        />
      </svg>
    </div>
  )
}
