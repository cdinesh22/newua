export default function AlertsBanner({ alerts=[] }) {
  if (!alerts.length) return null
  return (
    <div className="space-y-2">
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`p-3 rounded text-white animate-slide-up`}
          style={{animationDelay: `${i*60}ms`}}
        >
          <div className={`${a.severity==='critical' ? 'bg-red-700 ring-2 ring-red-400/40' : a.severity==='high' ? 'bg-red-500 ring-1 ring-red-300/40' : 'bg-yellow-500 ring-1 ring-yellow-300/40'} -m-3 p-3 rounded`}
          >
            <div className="font-semibold uppercase text-xs tracking-wide">{a.type}</div>
            <div className="mt-0.5 text-sm">{a.message}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
