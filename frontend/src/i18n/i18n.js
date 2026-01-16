// i18n initialization and configuration
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslation from './en.json'
import rwTranslation from './rw.json'
import swTranslation from './sw.json'
import frTranslation from './fr.json'

const resources = {
  en: { translation: enTranslation },
  rw: { translation: rwTranslation },
  sw: { translation: swTranslation },
  fr: { translation: frTranslation }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    ns: ['translation'],
    defaultNS: 'translation'
  })

export default i18n
