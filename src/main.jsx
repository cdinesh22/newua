import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/tailwind.css'
import { LanguageProvider } from './context/LanguageContext'
import OmClickEffect from './components/OmClickEffect'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <OmClickEffect />
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
)
