import { useLang } from '../context/LanguageContext'

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang } = useLang()

  const options = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'as', label: 'অসমীয়া (Assamese)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ks', label: 'कॉशुर / کٲشُر (Kashmiri)' },
    { code: 'ml', label: 'മലയാളം (Malayalam)' },
    { code: 'mni', label: 'Meitei / Manipuri' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'ne', label: 'नेपाली (Nepali)' },
    { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
  ]

  return (
    <div className="relative inline-block">
      <select
        aria-label="Language"
        className={`p-2 rounded-lg border border-white/50 bg-white/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)] ind-trans ${compact ? 'text-sm' : ''}`}
        value={lang}
        onChange={(e)=> setLang(e.target.value)}
      >
        {options.map(o => <option key={o.code} value={o.code}>{o.label}</option>)}
      </select>
    </div>
  )
}
