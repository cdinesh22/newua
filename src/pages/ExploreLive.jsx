import Layout from '../components/Layout'
import { useLang } from '../context/LanguageContext'

const gujaratTemples = [
  { name: 'Somnath Temple', img: '/images/somnath-1.svg', desc: 'Jyotirlinga on the Arabian Sea coast, revered for its spiritual significance.', links: [
    { label: 'Live Darshan', href: 'https://somnath.org/somnath-live-darshan' },
    { label: 'YouTube', href: 'https://www.youtube.com/@SomnathTempleOfficialChannel' },
  ]},
  { name: 'Dwarkadhish Temple', img: '/images/somnath-1.svg', desc: 'Ancient temple dedicated to Lord Krishna in Dwarka.', links: [
    { label: 'Live Darshan', href: 'https://utsav.gov.in/view-darshan/dwarkadhish-temple-live-darshan-1' },
    { label: 'YouTube', href: 'https://www.youtube.com/@shridwarkadhishmandirofficial/streams' },
  ]},
  { name: 'Ambaji Temple', img: '/images/somnath-1.svg', desc: 'One of the 51 Shakti Peethas, located at the Aravalli foothills.', links: [
    { label: 'Live Darshan', href: 'https://ambajitemple.in/ambaji-temple-gabbar-live-darshan' },
    { label: 'YouTube', href: 'https://www.youtube.com/playlist?list=PLYquhSvCdwmAc0MDARClrnIWsv9k4-HuI' },
  ]},
  { name: 'Pavagadh Mahakali Temple', img: '/images/somnath-1.svg', desc: 'Prominent Shakti shrine atop Pavagadh hill, part of the Champaner-Pavagadh site.', links: [
    { label: 'Website', href: 'https://www.pavagadhtemple.in' },
    { label: 'YouTube', href: 'https://www.youtube.com/watch?v=AtthWdqRe2Y' },
  ]},
  { name: 'Akshardham (Gandhinagar)', img: '/images/somnath-1.svg', desc: 'Cultural complex and spiritual campus in Gandhinagar.', links: [
    { label: 'Website', href: 'https://akshardham.com/gujarat/' },
    { label: 'BAPS Webcast', href: 'https://sabha.baps.org' },
  ]},
]

const otherTemples = [
  { name: 'Dakshinamurthy Temple (Bhavnagar)', img: '/images/somnath-1.svg', desc: 'Prominent temple in Bhavnagar; no direct live link found.', links: [
    { label: 'Info', href: 'https://bhavnagartourism.in' },
  ]},
  { name: 'Kashi Vishwanath Temple', img: '/images/somnath-1.svg', desc: 'Famous Jyotirlinga temple in Varanasi on the banks of the Ganga.', links: [
    { label: 'Official', href: 'https://shrikashivishwanath.org' },
  ]},
  { name: 'Tirumala Tirupati (TTD)', img: '/images/somnath-1.svg', desc: 'Renowned hill shrine of Lord Venkateswara, Andhra Pradesh.', links: [
    { label: 'Official', href: 'https://tirumala.org' },
  ]},
  { name: 'Shirdi Sai Baba Temple', img: '/images/somnath-1.svg', desc: 'Shrine of Sai Baba of Shirdi in Maharashtra.', links: [
    { label: 'Official', href: 'https://sai.org.in' },
  ]},
  { name: 'Vaishno Devi Shrine', img: '/images/somnath-1.svg', desc: 'Famous cave shrine in Jammu and Kashmir.', links: [
    { label: 'Official', href: 'https://www.maavaishnodevi.org' },
  ]},
  { name: 'Jagannath Temple (Puri)', img: '/images/somnath-1.svg', desc: 'Iconic temple in Puri, Odisha, known for the Rath Yatra.', links: [
    { label: 'Official', href: 'https://shreejagannatha.in' },
  ]},
  { name: 'Golden Temple (Amritsar)', img: '/images/somnath-1.svg', desc: 'Harmandir Sahib, the holiest Gurdwara of Sikhism.', links: [
    { label: 'Official', href: 'https://www.goldentempleamritsar.org' },
  ]},
  { name: 'Siddhivinayak (Mumbai)', img: '/images/somnath-1.svg', desc: 'Famous temple dedicated to Lord Ganesha in Mumbai.', links: [
    { label: 'Official', href: 'https://www.siddhivinayak.org' },
  ]},
  { name: 'Meenakshi Amman (Madurai)', img: '/images/somnath-1.svg', desc: 'Historic temple complex in Madurai, Tamil Nadu.', links: [
    { label: 'Info', href: 'https://maduraitourism.co.in' },
  ]},
  { name: 'Kamakhya Temple (Assam)', img: '/images/somnath-1.svg', desc: 'Important Shakti Peetha on the Nilachal Hills, Assam.', links: [
    { label: 'Official', href: 'https://kamakhyatemple.org' },
  ]},
]

function Section({ title, temples }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-saffron-800 mb-3">{title}</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {temples.map((t) => (
          <div key={t.name} className="glass-card ind-gradient-border p-4 rounded ind-card">
            <div className="text-base font-medium mb-2">{t.name}</div>
            <div className="flex flex-wrap gap-2">
              {t.links.map((l) => (
                <a
                  key={l.href}
                  className="px-3 py-1.5 text-sm rounded-lg bg-[color:var(--india-saffron)] text-white hover:opacity-90 ind-trans"
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ExploreLive() {
  const { t } = useLang()

  const ytEmbed = (src) => (
    <div className="relative w-full" style={{paddingTop:'56.25%'}}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg border ind-gradient-border"
        src={src}
        title="YouTube live"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
        <div className="relative overflow-hidden p-6 rounded-xl glass-card ind-gradient-border"
             style={{ background: 'linear-gradient(90deg, rgba(255,153,51,0.10) 0%, rgba(255,255,255,0.12) 50%, rgba(19,136,8,0.10) 100%)' }}>
          <div className="text-2xl font-bold text-saffron-800">{t('nav_live')}</div>
          <div className="text-gray-700">Quick links to live darshan, official websites, and YouTube streams.</div>
        </div>

        {/* Featured inline embeds */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Ambaji Playlist Embed */}
          <div className="glass-card ind-gradient-border p-4 rounded">
            <div className="font-semibold mb-2">Ambaji Temple — Live</div>
            {ytEmbed('https://www.youtube.com/embed/videoseries?list=PLYquhSvCdwmAc0MDARClrnIWsv9k4-HuI')}
            <div className="mt-2 text-sm">
              <a className="text-saffron-700 hover:underline mr-3" href="https://ambajitemple.in/ambaji-temple-gabbar-live-darshan" target="_blank" rel="noopener noreferrer">Official Live</a>
              <a className="text-saffron-700 hover:underline" href="https://www.youtube.com/playlist?list=PLYquhSvCdwmAc0MDARClrnIWsv9k4-HuI" target="_blank" rel="noopener noreferrer">YouTube Playlist</a>
            </div>
          </div>

          {/* Pavagadh Specific Video */}
          <div className="glass-card ind-gradient-border p-4 rounded">
            <div className="font-semibold mb-2">Pavagadh Mahakali Temple — Live/Recent</div>
            {ytEmbed('https://www.youtube.com/embed/AtthWdqRe2Y')}
            <div className="mt-2 text-sm">
              <a className="text-saffron-700 hover:underline mr-3" href="https://www.pavagadhtemple.in" target="_blank" rel="noopener noreferrer">Official Website</a>
              <a className="text-saffron-700 hover:underline" href="https://www.youtube.com/watch?v=AtthWdqRe2Y" target="_blank" rel="noopener noreferrer">YouTube</a>
            </div>
          </div>
        </div>

        {/* Somnath and Dwarka - likely iframe restrictions, provide links */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card ind-gradient-border p-4 rounded">
            <div className="font-semibold mb-2">Somnath Temple — Links</div>
            <p className="text-sm text-gray-600 mb-2">Some official sites restrict embedding. Use the links below:</p>
            <div className="flex flex-wrap gap-2">
              <a className="px-3 py-1.5 text-sm rounded-lg bg-[color:var(--india-saffron)] text-white hover:opacity-90 ind-trans" href="https://somnath.org/somnath-live-darshan" target="_blank" rel="noopener noreferrer">Live Darshan</a>
              <a className="px-3 py-1.5 text-sm rounded-lg bg-[color:var(--india-saffron)] text-white hover:opacity-90 ind-trans" href="https://www.youtube.com/@SomnathTempleOfficialChannel" target="_blank" rel="noopener noreferrer">YouTube Channel</a>
            </div>
          </div>
          <div className="glass-card ind-gradient-border p-4 rounded">
            <div className="font-semibold mb-2">Dwarkadhish Temple — Links</div>
            <p className="text-sm text-gray-600 mb-2">If embedding is blocked, open the official or YouTube links:</p>
            <div className="flex flex-wrap gap-2">
              <a className="px-3 py-1.5 text-sm rounded-lg bg-[color:var(--india-saffron)] text-white hover:opacity-90 ind-trans" href="https://utsav.gov.in/view-darshan/dwarkadhish-temple-live-darshan-1" target="_blank" rel="noopener noreferrer">Live Darshan</a>
              <a className="px-3 py-1.5 text-sm rounded-lg bg-[color:var(--india-saffron)] text-white hover:opacity-90 ind-trans" href="https://www.youtube.com/@shridwarkadhishmandirofficial/streams" target="_blank" rel="noopener noreferrer">YouTube Streams</a>
            </div>
          </div>
        </div>

        <Section title={`🛕 ${t('gujarat_temples')}`} temples={gujaratTemples} />
        <Section title={`🛕 ${t('other_temples')}`} temples={otherTemples} />
      </div>
    </Layout>
  )
}
