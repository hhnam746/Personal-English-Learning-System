/**
 * Web Speech API Multi-Language TTS Engine
 * Supports:
 * - English ('en' -> 'en-US')
 * - Japanese ('ja' -> 'ja-JP')
 * - Spanish ('es' -> 'es-ES')
 * - Italian ('it' -> 'it-IT')
 */

export const LANGUAGE_VOICE_MAP: Record<string, string> = {
  en: 'en-US',
  ja: 'ja-JP',
  es: 'es-ES',
  it: 'it-IT'
}

export function playTTS(term: string, language: string = 'en', rate?: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      reject(new Error('SpeechSynthesis not supported on this device.'))
      return
    }

    window.speechSynthesis.cancel() // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(term)
    const targetLocale = LANGUAGE_VOICE_MAP[language] || 'en-US'
    utterance.lang = targetLocale
    utterance.rate = rate ?? (language === 'ja' ? 0.9 : 0.95) // customizable or slightly slower for clarity

    // Try finding a matching native voice
    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find((v) => v.lang.startsWith(targetLocale.slice(0, 2)))
    if (voice) {
      utterance.voice = voice
    }

    utterance.onend = () => resolve()
    utterance.onerror = (e) => reject(e)

    window.speechSynthesis.speak(utterance)
  })
}
