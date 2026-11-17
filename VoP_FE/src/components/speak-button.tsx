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
    const local = audioUrl && /^\/audio\/[a-z0-9_-]+\.(mp3|wav|ogg)$/i.test(audioUrl)
    const pronounce = () => new Audio(`/api/pronunciation?term=${encodeURIComponent(term)}`).play()
    void (local ? new Audio(audioUrl).play().catch(pronounce) : pronounce())
      .catch(() => toast.error('Thiết bị chưa có âm thanh phát âm offline.'))
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
