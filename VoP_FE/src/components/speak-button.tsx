import { Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { playTTS } from '@/shared/audio-tts'

export function SpeakButton({
  term,
  audioUrl,
  text,
  language = 'en'
}: {
  term: string
  audioUrl?: string | null
  text?: string
  language?: string
}) {
  const speak = async () => {
    // 1. If explicit valid audio URL is provided, try playing it
    if (audioUrl) {
      try {
        await new Audio(audioUrl).play()
        return
      } catch {
        // Fall back to TTS
      }
    }

    // 2. Play using multi-language Web Speech API
    try {
      await playTTS(term, language)
    } catch {
      // 3. Fallback to server endpoint if present
      try {
        await new Audio(`/api/pronunciation?term=${encodeURIComponent(term)}`).play()
      } catch {
        toast.error('Thiết bị chưa hỗ trợ phát âm ngôn ngữ này.')
      }
    }
  }

  return (
    <Button
      variant="ghost"
      className={text ? 'text-link' : 'icon-button'}
      type="button"
      aria-label={`Phát âm ${term}`}
      onClick={speak}
    >
      <Volume2 className="icon" aria-hidden="true" />
      {text}
    </Button>
  )
}
