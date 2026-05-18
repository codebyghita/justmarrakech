import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'
import './i18n' // Required for i18next
import './utils/gsapSetup' // Global GSAP setup

// Add ngrok bypass header globally so API calls always skip the interstitial
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
