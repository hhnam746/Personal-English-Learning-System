import { Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
export function SpeakButton({
  term,
  audioUrl,
  text
}: {
  term: string
  audioUrl?: string | null
  text?: string
}) {
  const speak = () => {
    if (audioUrl) {
      void new Audio(audioUrl)
        .play()
        .catch(() => toast.error('Không phát được âm thanh.'))
      return
    }
    if (!('speechSynthesis' in window)) {
      toast.error('Thiết bị chưa hỗ trợ phát âm.')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(term)
    utterance.lang = 'en-US'
    window.speechSynthesis.speak(utterance)
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
