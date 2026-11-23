import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Bell, Play, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface GoldenTimeWidgetProps {
  dueCount: number
  newCount: number
}

export function GoldenTimeWidget({ dueCount, newCount }: GoldenTimeWidgetProps) {
  const [hasNotificationPermission, setHasNotificationPermission] = useState(
    () => typeof window !== 'undefined'
      && 'Notification' in window
      && Notification.permission === 'granted'
  )

  const requestNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.info('Trình duyệt không hỗ trợ thông báo.')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setHasNotificationPermission(true)
        toast.success('Đã bật thông báo! Hệ thống sẽ nhắc khi đến Thời điểm vàng.')
      } else {
        toast.info('Thông báo chưa được cấp quyền.')
      }
    } catch {
      toast.error('Không thể kích hoạt thông báo.')
    }
  }

  const isGoldenTime = dueCount > 0

  return (
    <div
      className={`rounded-2xl p-5 border backdrop-blur-xl transition-all shadow-lg relative overflow-hidden mb-6 ${
        isGoldenTime
          ? 'bg-gradient-to-r from-[#FD5F01]/15 via-orange-500/10 to-amber-500/10 border-[#FD5F01]/40'
          : 'bg-card/70 border-border/60'
      }`}
    >
      {/* Decorative pulse when in Golden Time */}
      {isGoldenTime && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FD5F01]/20 rounded-full blur-2xl animate-pulse pointer-events-none" />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                isGoldenTime
                  ? 'bg-[#FD5F01] text-white shadow-sm'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isGoldenTime ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  Thời điểm vàng ôn tập
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Trí nhớ ổn định
                </>
              )}
            </span>

            {!hasNotificationPermission && (
              <button
                type="button"
                onClick={requestNotification}
                className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors cursor-pointer"
                title="Bật nhắc nhở khi đến thời điểm vàng"
              >
                <Bell className="w-3 h-3 text-[#FD5F01]" />
                Bật nhắc nhở
              </button>
            )}
          </div>

          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            {isGoldenTime ? (
              <>
                Có <span className="text-[#FD5F01] text-lg font-extrabold">{dueCount}</span> từ vựng đang chờ bạn ôn tập!
              </>
            ) : (
              'Bạn chưa có từ vựng nào bị quá hạn'
            )}
          </h3>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {isGoldenTime
              ? 'Theo đường cong quên lãng Ebbinghaus của MochiMochi, ôn lại ngay lúc này giúp kích hoạt active recall và tăng cấp độ ghi nhớ lên não bộ lâu dài.'
              : newCount > 0
                ? `Hiện có ${newCount} từ mới sẵn sàng trong kho. Hãy bắt đầu học để nạp thêm kiến thức mới!`
                : 'Tất cả từ vựng đều được ghi nhớ tốt. Hãy quay lại khi các mốc Spaced Repetition tiếp theo đến hạn.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {isGoldenTime ? (
            <Link to="/practice">
              <Button className="h-10 px-5 rounded-xl bg-[#FD5F01] hover:bg-[#e05401] text-white font-semibold shadow-md flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                <Play className="w-4 h-4 fill-white" />
                Ôn ngay thời điểm vàng
              </Button>
            </Link>
          ) : (
            <Link to="/practice">
              <Button variant="outline" className="h-10 px-4 rounded-xl border-border/80 font-medium flex items-center gap-2 hover:bg-accent/60 cursor-pointer">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Luyện tập thêm
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
