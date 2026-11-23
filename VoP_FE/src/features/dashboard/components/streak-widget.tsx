import { Flame, Calendar, Award } from 'lucide-react'
import type { DailyActivity } from '../types'

interface StreakWidgetProps {
  activity: DailyActivity[]
}

export function StreakWidget({ activity }: StreakWidgetProps) {
  // Sort activity descending by date
  const sorted = [...activity].sort((a, b) => b.date.localeCompare(a.date))

  // Calculate current streak
  let currentStreak = 0
  for (const day of sorted) {
    const hasStudy = day.assessmentAnswers > 0 || day.flashcardReviews > 0 || day.completedSessions > 0
    if (hasStudy) {
      currentStreak++
    } else {
      break
    }
  }

  // Last 7 days for visual tracker
  const last7Days = sorted.slice(0, 7).reverse()

  return (
    <div className="rounded-2xl p-4 bg-card/75 backdrop-blur-xl border border-border/60 shadow-md flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-[#FD5F01] flex items-center justify-center">
            <Flame className="w-5 h-5 fill-[#FD5F01] text-[#FD5F01] animate-bounce" />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chuỗi học tập</h4>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-foreground">{currentStreak}</span>
              <span className="text-xs font-medium text-muted-foreground">ngày liên tiếp</span>
            </div>
          </div>
        </div>

        {currentStreak >= 3 && (
          <div className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-semibold flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            Học chăm chỉ
          </div>
        )}
      </div>

      <div className="space-y-1.5 pt-2 border-t border-border/40">
        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3 text-[#FD5F01]" />
          7 ngày gần nhất:
        </p>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {last7Days.map((day) => {
            const isActive = day.assessmentAnswers > 0 || day.flashcardReviews > 0 || day.completedSessions > 0
            const dayNum = day.date.slice(8)
            return (
              <div
                key={day.date}
                className={`py-1.5 px-1 rounded-xl text-[10px] font-semibold transition-all ${
                  isActive
                    ? 'bg-[#FD5F01] text-white shadow-sm'
                    : 'bg-muted/40 text-muted-foreground'
                }`}
                title={`${day.date}: ${isActive ? 'Đã học' : 'Nghỉ'}`}
              >
                <div>{dayNum}</div>
                <div className="text-[9px] mt-0.5">{isActive ? '✓' : '•'}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
