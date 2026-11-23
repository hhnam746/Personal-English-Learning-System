import { Link } from 'react-router-dom'
import { Layers, ChevronRight, Sparkles } from 'lucide-react'

interface MochiMemoryTiersProps {
  levels: { level: number; count: number }[]
  totalLearned: number
}

const LEVEL_DESCRIPTIONS = [
  { level: 1, name: 'Cấp độ 1: Mới học', interval: 'Ôn sau 10 phút', color: 'from-red-500 to-rose-500', badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' },
  { level: 2, name: 'Cấp độ 2: Bắt đầu nhớ', interval: 'Ôn sau 6 giờ', color: 'from-amber-500 to-orange-500', badge: 'bg-orange-500/15 text-orange-600 dark:text-orange-400' },
  { level: 3, name: 'Cấp độ 3: Đã nhớ sơ sơ', interval: 'Ôn sau 1 ngày', color: 'from-yellow-500 to-amber-500', badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  { level: 4, name: 'Cấp độ 4: Đã nhớ tốt', interval: 'Ôn sau 3 ngày', color: 'from-blue-500 to-cyan-500', badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  { level: 5, name: 'Cấp độ 5: Khắc sâu não bộ', interval: 'Ôn duy trì 7-14 ngày', color: 'from-emerald-500 to-teal-500', badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' }
]

export function MochiMemoryTiers({ levels, totalLearned }: MochiMemoryTiersProps) {
  const getCount = (lvl: number) => levels.find((l) => l.level === lvl)?.count ?? 0

  return (
    <div className="rounded-2xl p-5 bg-card/75 backdrop-blur-xl border border-border/60 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#FD5F01]" />
          <h3 className="text-base font-bold text-foreground">5 Cấp độ ghi nhớ Mochi SRS</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          Tổng <strong className="text-foreground">{totalLearned}</strong> từ đã học
        </span>
      </div>

      <div className="space-y-3">
        {LEVEL_DESCRIPTIONS.map((item) => {
          const count = getCount(item.level)
          const percent = totalLearned > 0 ? Math.round((count / totalLearned) * 100) : 0

          return (
            <Link
              key={item.level}
              to={`/library?filter=${item.level}`}
              className="block group p-2.5 rounded-xl hover:bg-accent/50 border border-transparent hover:border-border/60 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${item.badge}`}>
                    L{item.level}
                  </span>
                  <span className="font-semibold text-foreground group-hover:text-[#FD5F01] transition-colors">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">
                    ({item.interval})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{count} từ</span>
                  <span className="text-[11px] text-muted-foreground font-medium w-8 text-right">
                    {percent}%
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                  style={{ width: `${Math.max(percent, count > 0 ? 3 : 0)}%` }}
                />
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#FD5F01]" />
          Lên cấp khi trả lời đúng vào Thời điểm vàng
        </span>
        <Link to="/practice" className="text-[#FD5F01] hover:underline font-medium">
          Luyện tập ngay →
        </Link>
      </div>
    </div>
  )
}
