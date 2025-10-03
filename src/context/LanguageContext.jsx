import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LanguageContext = createContext()

const translations = {
  en: {
    app_name: 'TCM',
    app_tagline: 'Temple Crowd Management',
    nav_home: 'Home',
    nav_dashboard: 'User Dashboard',
    nav_simulation: 'Simulation',
    nav_live: 'Explore Live',
    nav_contact: 'Contact',
    nav_admin: 'Admin',
    hero_title: 'Temple & Pilgrimage Crowd Management',
    hero_sub: 'Plan your darshan, book slots, and view live crowd updates for Somnath, Dwarka, Ambaji, and Pavagadh.',
    hero_btn_book: 'Book Darshan Slot',
    live_widget_title: 'Live Realtime Updates',
    live_widget_sub: 'Official timings, current crowd and slot availability',
    explore_live: 'Explore Live',
    gujarat_temples: 'Gujarat Temples',
    other_temples: 'Other Major Temples in India',
    search_temples: 'Search temples...',
    search: 'Search',
    feat_pilgrims_title: 'Features for Pilgrims',
    feat_pilgrims_item1: 'Registration & Login',
    feat_pilgrims_item2: 'Darshan Slot Booking with QR Pass',
    feat_pilgrims_item3: 'Live Crowd Density & Route Planner',
    feat_pilgrims_item4: 'Simulation: Parking, Temple & Crowd Levels',
    feat_pilgrims_item5: 'Live Explore (Realtime Map & Status)',
    feat_pilgrims_item6: 'Navigation Assistance (Route & Facilities)',
    feat_pilgrims_item7: 'Waiting Times & Queue Information',
    feat_admin_title: 'Features for Admin',
    feat_admin_item1: 'Slot & Capacity Management',
    feat_admin_item2: 'Crowd Simulation & Emergency Alerts',
    feat_admin_item3: 'Analytics & Reports',
    // Contact & Help
    contact_title: 'Contact & Help',
    faqs: 'FAQs',
    faq_q1: 'How to book a slot?',
    faq_a1: 'Login and go to the dashboard to book available slots.',
    faq_q2: 'What is Emergency Mode?',
    faq_a2: 'Admin can trigger alerts visible across the app.',
    emergency_helplines: 'Emergency Helplines',
    medical_emergency: 'Medical Emergency',
    police: 'Police',
    temple_security: 'Temple Security',
    // Assistant
    assistant_title: 'Assistant',
    assistant_greeting: 'Namaste! I am your assistant. Ask about timings, location, rules, or facilities. 🙏',
    assistant_quick_1: 'What are the timings?',
    assistant_quick_2: 'Where is it located?',
    assistant_quick_3: 'What are the rules?',
    assistant_quick_4: 'What facilities are available?',
    assistant_input_placeholder: 'Ask about timings, rules, location...'
    ,assistant_send: 'Send'
    ,assistant_sending: '...'
  },
  hi: {
    app_name: 'टीसीएम',
    app_tagline: 'मंदिर भीड़ प्रबंधन',
    nav_home: 'होम',
    nav_dashboard: 'उपयोगकर्ता डैशबोर्ड',
    nav_simulation: 'सिमुलेशन',
    nav_live: 'लाइव देखें',
    nav_contact: 'संपर्क',
    nav_admin: 'एडमिन',
    hero_title: 'मंदिर और तीर्थयात्रा भीड़ प्रबंधन',
    hero_sub: 'अपने दर्शन की योजना बनाएं, स्लॉट बुक करें, और सोमनाथ, द्वारका, अंबाजी और पावागढ़ के लाइव भीड़ अपडेट देखें।',
    hero_btn_book: 'दर्शन स्लॉट बुक करें',
    live_widget_title: 'लाइव रियलटाइम अपडेट',
    live_widget_sub: 'आधिकारिक समय, वर्तमान भीड़ और स्लॉट उपलब्धता',
    explore_live: 'लाइव देखें',
    gujarat_temples: 'गुजरात के मंदिर',
    other_temples: 'भारत के अन्य प्रमुख मंदिर',
    search_temples: 'मंदिर खोजें...',
    search: 'खोजें',
    feat_pilgrims_title: 'तीर्थयात्रियों के लिए सुविधाएँ',
    feat_pilgrims_item1: 'पंजीकरण और लॉगिन',
    feat_pilgrims_item2: 'क्यूआर पास के साथ दर्शन स्लॉट बुकिंग',
    feat_pilgrims_item3: 'लाइव भीड़ घनत्व और रूट प्लानर',
    feat_admin_title: 'प्रशासक के लिए सुविधाएँ',
    feat_admin_item1: 'स्लॉट और क्षमता प्रबंधन',
    feat_admin_item2: 'भीड़ सिमुलेशन और आपातकालीन अलर्ट',
    feat_admin_item3: 'एनालिटिक्स और रिपोर्ट',
    // Contact & Help
    contact_title: 'संपर्क और सहायता',
    faqs: 'सामान्य प्रश्न',
    faq_q1: 'स्लॉट कैसे बुक करें?',
    faq_a1: 'लॉगिन करें और डैशबोर्ड में जाकर उपलब्ध स्लॉट बुक करें।',
    faq_q2: 'इमरजेंसी मोड क्या है?',
    faq_a2: 'एडमिन ऐप भर में दिखने वाले अलर्ट ट्रिगर कर सकते हैं।',
    emergency_helplines: 'आपातकालीन हेल्पलाइन',
    medical_emergency: 'चिकित्सा आपातकाल',
    police: 'पुलिस',
    temple_security: 'मंदिर सुरक्षा',
    // Assistant
    assistant_title: 'सहायक',
    assistant_greeting: 'नमस्ते! मैं आपका सहायक हूँ। समय, स्थान, नियम या सुविधाओं के बारे में पूछें। 🙏',
    assistant_quick_1: 'समय क्या हैं?',
    assistant_quick_2: 'यह कहाँ स्थित है?',
    assistant_quick_3: 'नियम क्या हैं?',
    assistant_quick_4: 'कौन-सी सुविधाएँ उपलब्ध हैं?',
    assistant_input_placeholder: 'समय, नियम, स्थान के बारे में पूछें...'
    ,assistant_send: 'भेजें'
    ,assistant_sending: '...'
  },
  gu: {
    app_name: 'ટીસીએમ',
    app_tagline: 'મંદિર ભીડ વ્યવસ્થાપન',
    nav_home: 'હોમ',
    nav_dashboard: 'યુઝર ડેશબોર્ડ',
    nav_simulation: 'સિમ્યુલેશન',
    nav_live: 'લાઇવ જુઓ',
    nav_contact: 'સંપર્ક',
    nav_admin: 'એડમિન',
    hero_title: 'મંદિર અને તીર્થયાત્રા ભીડ વ્યવસ્થાપન',
    hero_sub: 'તમારા દર્શનની યોજના બનાવો, સ્લોટ બુક કરો, અને સોમનાથ, દ્વારકા, અંબાજી અને પાવાગઢના લાઇવ ભીડ અપડેટ જુઓ.',
    hero_btn_book: 'દર્શન સ્લોટ બુક કરો',
    live_widget_title: 'લાઇવ રિયલટાઇમ અપડેટ',
    live_widget_sub: 'સત્તાવાર સમય, વર્તમાન ભીડ અને સ્લોટ ઉપલબ્ધતા',
    explore_live: 'લાઇવ જુઓ',
    gujarat_temples: 'ગુજરાતના મંદિર',
    other_temples: 'ભારતના અન્ય મુખ્ય મંદિર',
    search_temples: 'મંદિર શોધો...',
    search: 'શોધો',
    feat_pilgrims_title: 'યાત્રિકો માટેની સુવિધાઓ',
    feat_pilgrims_item1: 'રજીસ્ટ્રેશન અને લોગિન',
    feat_pilgrims_item2: 'ક્યુઆર પાસ સાથે દર્શન સ્લોટ બુકિંગ',
    feat_pilgrims_item3: 'લાઇવ ભીડ ઘનત્વ અને રૂટ પ્લાનર',
    feat_admin_title: 'એડમિન માટેની સુવિધાઓ',
    feat_admin_item1: 'સ્લોટ અને ક્ષમતા મેનેજમેન્ટ',
    feat_admin_item2: 'ભીડ સિમ્યુલેશન અને ઇમરજન્સી એલર્ટ',
    feat_admin_item3: 'એનાલિટિક્સ અને રિપોર્ટ્સ',
    // Assistant
    assistant_title: 'સહાયક',
    assistant_greeting: 'નમસ્તે! હું તમારો સહાયક છું. સમય, સ્થાન, નિયમો અથવા સુવિધાઓ વિશે પૂછો. 🙏',
    assistant_quick_1: 'સમય શું છે?',
    assistant_quick_2: 'આ ક્યાં આવેલું છે?',
    assistant_quick_3: 'નિયમો શું છે?',
    assistant_quick_4: 'કઈ સુવિધાઓ ઉપલબ્ધ છે?',
    assistant_input_placeholder: 'સમય, નિયમો, સ્થાન વિશે પૂછો...'
    ,assistant_send: 'મોકલો'
    ,assistant_sending: '...'
  }
}

// Extend with additional Indian languages using English placeholders initially.
// Keys mirror the English dictionary to ensure full coverage across the UI.
const extraLangTemplate = {
  app_name: 'TCM',
  app_tagline: 'Temple Crowd Management',
  nav_home: 'Home',
  nav_dashboard: 'User Dashboard',
  nav_simulation: 'Simulation',
  nav_live: 'Explore Live',
  nav_contact: 'Contact',
  nav_admin: 'Admin',
  hero_title: 'Temple & Pilgrimage Crowd Management',
  hero_sub: 'Plan your darshan, book slots, and view live crowd updates for Somnath, Dwarka, Ambaji, and Pavagadh.',
  hero_btn_book: 'Book Darshan Slot',
  live_widget_title: 'Live Realtime Updates',
  live_widget_sub: 'Official timings, current crowd and slot availability',
  explore_live: 'Explore Live',
  gujarat_temples: 'Gujarat Temples',
  other_temples: 'Other Major Temples in India',
  search_temples: 'Search temples...',
  search: 'Search',
  feat_pilgrims_title: 'Features for Pilgrims',
  feat_pilgrims_item1: 'Registration & Login',
  feat_pilgrims_item2: 'Darshan Slot Booking with QR Pass',
  feat_pilgrims_item3: 'Live Crowd Density & Route Planner',
  feat_pilgrims_item4: 'Simulation: Parking, Temple & Crowd Levels',
  feat_pilgrims_item5: 'Live Explore (Realtime Map & Status)',
  feat_pilgrims_item6: 'Navigation Assistance (Route & Facilities)',
  feat_pilgrims_item7: 'Waiting Times & Queue Information',
  feat_admin_title: 'Features for Admin',
  feat_admin_item1: 'Slot & Capacity Management',
  feat_admin_item2: 'Crowd Simulation & Emergency Alerts',
  feat_admin_item3: 'Analytics & Reports',
  // Contact & Help
  contact_title: 'Contact & Help',
  faqs: 'FAQs',
  faq_q1: 'How to book a slot?',
  faq_a1: 'Login and go to the dashboard to book available slots.',
  faq_q2: 'What is Emergency Mode?',
  faq_a2: 'Admin can trigger alerts visible across the app.',
  emergency_helplines: 'Emergency Helplines',
  medical_emergency: 'Medical Emergency',
  police: 'Police',
  temple_security: 'Temple Security',
  // Assistant (defaults for extra languages)
  assistant_title: 'Assistant',
  assistant_greeting: 'Namaste! I am your assistant. Ask about timings, location, rules, or facilities. 🙏',
  assistant_quick_1: 'What are the timings?',
  assistant_quick_2: 'Where is it located?',
  assistant_quick_3: 'What are the rules?',
  assistant_quick_4: 'What facilities are available?',
  assistant_input_placeholder: 'Ask about timings, rules, location...'
  ,assistant_send: 'Send'
  ,assistant_sending: '...'
}

translations.as = { ...extraLangTemplate } // Assamese
translations.bn = { ...extraLangTemplate } // Bengali
translations.kn = { ...extraLangTemplate } // Kannada
translations.ks = { ...extraLangTemplate } // Kashmiri
translations.ml = { ...extraLangTemplate } // Malayalam
translations.mni = { ...extraLangTemplate } // Manipuri (Meitei)
translations.mr = { ...extraLangTemplate } // Marathi
translations.ne = { ...extraLangTemplate } // Nepali
translations.or = { ...extraLangTemplate } // Odia
translations.pa = { ...extraLangTemplate } // Punjabi
translations.ta = { ...extraLangTemplate } // Tamil
translations.te = { ...extraLangTemplate } // Telugu

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('tcm_lang') || 'en')

  useEffect(() => {
    localStorage.setItem('tcm_lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = useMemo(() => {
    const dict = translations[lang] || translations.en
    return (key) => dict[key] || translations.en[key] || key
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  return useContext(LanguageContext)
}
