import { useState } from 'react'
import Layout from '../components/Layout'
import { useLang } from '../context/LanguageContext'
import api from '../api/client'

export default function Contact() {
  const { t } = useLang()
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: '', msg: '' })

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: '', msg: '' })
    // basic validation
    if (!form.name || !form.email || !form.message) {
      setStatus({ type: 'error', msg: 'Please fill name, email and message.' })
      return
    }
    try {
      setSubmitting(true)
      await api.post('/api/contact', form)
      setStatus({ type: 'success', msg: 'Thanks! Your message has been sent.' })
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (e) {
      setStatus({ type: 'error', msg: e?.response?.data?.message || 'Failed to send. Please try again.' })
    } finally { setSubmitting(false) }
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
        {/* Header */}
        <div className="relative overflow-hidden p-6 rounded-xl glass-card ind-gradient-border"
             style={{ background: 'linear-gradient(90deg, rgba(255,153,51,0.10) 0%, rgba(255,255,255,0.12) 50%, rgba(19,136,8,0.10) 100%)' }}>
          <div className="text-2xl font-bold text-saffron-800">{t('contact_title')}</div>
          <div className="text-gray-700">We are here to help. Reach us via form or the details below.</div>
        </div>

        {/* Contact details + Map */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card ind-gradient-border p-4 rounded space-y-3">
            <div className="text-lg font-semibold text-saffron-800">Contact Information</div>
            <div className="text-gray-700 space-y-2 text-sm">
              <div>
                <div className="font-medium">Office Address</div>
                <div>Temple Crowd Management, Sector 10, Gandhinagar, Gujarat, 382010</div>
              </div>
              <div>
                <div className="font-medium">Phone</div>
                <div>+91-79-1234-5678</div>
              </div>
              <div>
                <div className="font-medium">Email</div>
                <div><a className="text-blue-600 hover:underline" href="mailto:support@tcm.gov.in">support@tcm.gov.in</a></div>
              </div>
              <div>
                <div className="font-medium">Working Hours</div>
                <div>Mon–Sat: 9:00 AM – 6:00 PM IST</div>
              </div>
              <div>
                <div className="font-medium">Social</div>
                <div className="flex gap-3 text-[color:var(--india-saffron)]">
                  <a href="#" aria-label="Twitter" className="hover:underline">Twitter</a>
                  <a href="#" aria-label="Facebook" className="hover:underline">Facebook</a>
                  <a href="#" aria-label="YouTube" className="hover:underline">YouTube</a>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card ind-gradient-border p-0 rounded overflow-hidden">
            <iframe
              title="Office Location"
              src="https://www.google.com/maps?q=Gandhinagar%2C%20Gujarat&output=embed"
              className="w-full h-[320px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Contact form */}
        <div className="glass-card ind-gradient-border p-6 rounded">
          <div className="text-lg font-semibold text-saffron-800 mb-2">Send us a message</div>
          {status.msg ? (
            <div className={`mb-3 text-sm rounded px-3 py-2 ${status.type==='success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{status.msg}</div>
          ) : null}
          <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
            <input name="name" value={form.name} onChange={onChange} placeholder="Your Name*" className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)]" />
            <input type="email" name="email" value={form.email} onChange={onChange} placeholder="Email*" className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)]" />
            <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone" className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)]" />
            <input name="subject" value={form.subject} onChange={onChange} placeholder="Subject" className="p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)]" />
            <textarea name="message" value={form.message} onChange={onChange} placeholder="Message*" rows={4} className="md:col-span-2 p-2 rounded-lg border border-white/50 bg-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[color:var(--india-saffron)]" />
            <div className="md:col-span-2 flex items-center justify-between">
              <div className="text-xs text-gray-500">Fields marked * are required.</div>
              <button type="submit" className="btn-india ind-gradient-border" disabled={submitting}>{submitting ? 'Sending...' : 'Send Message'}</button>
            </div>
          </form>
        </div>

        {/* FAQs and helplines */}
        <div className="glass-card ind-gradient-border p-6 rounded">
          <div className="text-lg font-semibold text-saffron-800 mb-2">{t('faqs')}</div>
          <ul className="list-disc ml-5 text-gray-700 space-y-1">
            <li>{t('faq_q1')} {t('faq_a1')}</li>
            <li>{t('faq_q2')} {t('faq_a2')}</li>
          </ul>
          <div className="font-semibold mt-4">{t('emergency_helplines')}</div>
          <ul className="list-disc ml-5 text-gray-700 space-y-1">
            <li>{t('medical_emergency')}: 108</li>
            <li>{t('police')}: 100</li>
            <li>{t('temple_security')}: Check temple info section</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
