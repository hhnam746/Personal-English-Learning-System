import { useId, type CSSProperties, type PropsWithChildren } from 'react'
import { cn } from '@/shared/utils'
import { useOrganicMorph } from './organic-morph'

export function BrainBlob({
  className
}: PropsWithChildren<{ className?: string }>) {
  const id = useId().replace(/:/g, '')
  const containerRef = useOrganicMorph('brain')

  return (
    <div
      ref={containerRef}
      className={cn('organic-blob organic-blob--brain', className)}
      data-blob-variant="brain"
      style={{ '--blob-clip': `url(#${id}-blob-clip)` } as CSSProperties}
    >
      <svg
        className="organic-blob__defs"
        width="1"
        height="1"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={`${id}-blob-clip`} clipPathUnits="objectBoundingBox">
            <path d="M .730 .026 C .881 .005 .982 .136 .970 .301 C .960 .468 .862 .568 .833 .730 C .810 .891 .733 .983 .610 .958 C .488 .933 .474 .799 .364 .734 C .250 .666 .090 .673 .048 .558 C .002 .432 .116 .305 .253 .197 C .388 .090 .568 .049 .730 .026 Z" />
          </clipPath>
        </defs>
      </svg>

      <svg
        className="organic-blob__shadow"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id={`${id}-blob-shadow`}
            x="-.2"
            y="-.2"
            width="1.4"
            height="1.5"
          >
            <feDropShadow
              dx="0"
              dy=".025"
              stdDeviation=".022"
              floodColor="#9c6d50"
              floodOpacity=".10"
            />
          </filter>
        </defs>
        <path
          d="M .730 .026 C .881 .005 .982 .136 .970 .301 C .960 .468 .862 .568 .833 .730 C .810 .891 .733 .983 .610 .958 C .488 .933 .474 .799 .364 .734 C .250 .666 .090 .673 .048 .558 C .002 .432 .116 .305 .253 .197 C .388 .090 .568 .049 .730 .026 Z"
          fill="var(--blob-shadow-fill)"
          filter={`url(#${id}-blob-shadow)`}
        />
      </svg>
      <div className="organic-blob__glass" aria-hidden="true"></div>
      <svg
        className="organic-blob__edge"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient
            id={`${id}-blob-volume`}
            cx=".47"
            cy=".42"
            r=".7"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0" stopColor="var(--blob-volume-center)" />
            <stop offset=".7" stopColor="var(--blob-volume-mid)" />
            <stop offset="1" stopColor="var(--blob-volume-edge)" />
          </radialGradient>
          <linearGradient
            id={`${id}-blob-face`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="var(--blob-face-light)" />
            <stop offset=".45" stopColor="var(--blob-face-peach)" />
            <stop offset="1" stopColor="var(--blob-face-light)" />
          </linearGradient>
          <linearGradient
            id={`${id}-blob-rim`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
            gradientUnits="userSpaceOnUse"
          >
            <stop className="blob-rim-bright" offset="0" />
            <stop className="blob-rim-soft" offset=".43" />
            <stop className="blob-rim-faint" offset=".7" />
            <stop className="blob-rim-soft" offset="1" />
          </linearGradient>
          <linearGradient
            id={`${id}-blob-highlight`}
            x1="0"
            y1="0"
            x2="1"
            y2=".65"
            gradientUnits="userSpaceOnUse"
          >
            <stop className="blob-rim-bright" offset="0" />
            <stop className="blob-rim-soft" offset=".6" />
            <stop className="blob-rim-faint" offset="1" />
          </linearGradient>
        </defs>
        <path
          className="organic-blob__body"
          d="M .730 .026 C .881 .005 .982 .136 .970 .301 C .960 .468 .862 .568 .833 .730 C .810 .891 .733 .983 .610 .958 C .488 .933 .474 .799 .364 .734 C .250 .666 .090 .673 .048 .558 C .002 .432 .116 .305 .253 .197 C .388 .090 .568 .049 .730 .026 Z"
          fill={`url(#${id}-blob-face)`}
        />
        <path
          className="organic-blob__body"
          d="M .730 .026 C .881 .005 .982 .136 .970 .301 C .960 .468 .862 .568 .833 .730 C .810 .891 .733 .983 .610 .958 C .488 .933 .474 .799 .364 .734 C .250 .666 .090 .673 .048 .558 C .002 .432 .116 .305 .253 .197 C .388 .090 .568 .049 .730 .026 Z"
          fill={`url(#${id}-blob-volume)`}
        />
        <path
          className="organic-blob__thickness"
          d="M .730 .026 C .881 .005 .982 .136 .970 .301 C .960 .468 .862 .568 .833 .730 C .810 .891 .733 .983 .610 .958 C .488 .933 .474 .799 .364 .734 C .250 .666 .090 .673 .048 .558 C .002 .432 .116 .305 .253 .197 C .388 .090 .568 .049 .730 .026 Z"
          stroke={`url(#${id}-blob-rim)`}
        />
        <path
          className="organic-blob__inner-edge"
          d="M .730 .026 C .881 .005 .982 .136 .970 .301 C .960 .468 .862 .568 .833 .730 C .810 .891 .733 .983 .610 .958 C .488 .933 .474 .799 .364 .734 C .250 .666 .090 .673 .048 .558 C .002 .432 .116 .305 .253 .197 C .388 .090 .568 .049 .730 .026 Z"
          transform="translate(.012 .017) scale(.976 .952)"
          stroke={`url(#${id}-blob-rim)`}
        />
        <path
          className="organic-blob__outline"
          d="M .730 .026 C .881 .005 .982 .136 .970 .301 C .960 .468 .862 .568 .833 .730 C .810 .891 .733 .983 .610 .958 C .488 .933 .474 .799 .364 .734 C .250 .666 .090 .673 .048 .558 C .002 .432 .116 .305 .253 .197 C .388 .090 .568 .049 .730 .026 Z"
          stroke={`url(#${id}-blob-rim)`}
        />
        <path
          className="organic-blob__highlight"
          d="M .253 .197 C .388 .090 .568 .049 .730 .026 C .881 .005 .982 .136 .970 .301"
          stroke={`url(#${id}-blob-highlight)`}
        />
        <path
          className="organic-blob__highlight organic-blob__highlight--lower"
          d="M .833 .730 C .810 .891 .733 .983 .610 .958 C .488 .933 .474 .799 .364 .734"
          stroke={`url(#${id}-blob-rim)`}
        />
      </svg>
      <div className="organic-blob__content">
        <svg
          className="brain-illustration"
          viewBox="65 65 195 175"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <radialGradient
              id={`${id}-brain-cerebrum`}
              gradientUnits="userSpaceOnUse"
              cx="151"
              cy="145"
              r="106"
              gradientTransform="translate(151 145) scale(1 .72) translate(-151 -145)"
            >
              <stop stopColor="var(--brain-base)" />
              <stop offset=".28" stopColor="var(--brain-base)" />
              <stop offset=".58" stopColor="var(--brain-top)" />
              <stop offset=".86" stopColor="var(--brain-peach)" />
              <stop offset="1" stopColor="var(--brain-cream)" />
            </radialGradient>
            <radialGradient
              id={`${id}-brain-temporal`}
              gradientUnits="userSpaceOnUse"
              cx="158"
              cy="141"
              r="70"
            >
              <stop stopColor="var(--brain-base)" />
              <stop offset=".55" stopColor="var(--brain-temporal-mid)" />
              <stop offset="1" stopColor="var(--brain-temporal-edge)" />
            </radialGradient>
            <linearGradient
              id={`${id}-brain-cerebellum`}
              gradientUnits="userSpaceOnUse"
              x1="181"
              y1="178"
              x2="198"
              y2="209"
            >
              <stop stopColor="var(--brain-base)" />
              <stop offset=".55" stopColor="var(--brain-top)" />
              <stop offset="1" stopColor="var(--brain-temporal-edge)" />
            </linearGradient>
            <linearGradient
              id={`${id}-brain-stem`}
              gradientUnits="userSpaceOnUse"
              x1="177"
              y1="198"
              x2="195"
              y2="222"
            >
              <stop stopColor="var(--brain-top)" />
              <stop offset="1" stopColor="var(--brain-cream)" />
            </linearGradient>
            <linearGradient
              id={`${id}-brain-rim`}
              gradientUnits="userSpaceOnUse"
              x1="119"
              y1="83"
              x2="223"
              y2="184"
            >
              <stop stopColor="#fffdf1" />
              <stop offset=".52" stopColor="var(--brain-edge)" />
              <stop offset="1" stopColor="#ffe8c6" stopOpacity=".65" />
            </linearGradient>
            <radialGradient
              id={`${id}-brain-light`}
              gradientUnits="userSpaceOnUse"
              cx="133"
              cy="90"
              r="75"
            >
              <stop stopColor="#fffff5" stopOpacity=".45" />
              <stop offset=".46" stopColor="#fff5d8" stopOpacity=".13" />
              <stop offset="1" stopColor="#fff5d8" stopOpacity="0" />
            </radialGradient>
            <filter
              id={`${id}-brain-soft`}
              x="-15%"
              y="-15%"
              width="130%"
              height="130%"
            >
              <feGaussianBlur stdDeviation="1.1" />
            </filter>
            <path
              id={`${id}-brain-shape`}
              d="M164 88 C159 78 146 78 134 82 C119 86 108 96 100 106 C91 116 82 129 81 140 C78 150 82 160 87 165 C94 175 108 176 119 170 C122 184 136 191 151 190 C164 196 178 191 190 187 C203 180 214 181 225 180 C236 180 243 172 243 159 C244 146 239 133 235 121 C229 106 217 94 203 88 C189 80 173 76 164 88 Z"
            />
            <path
              id={`${id}-brain-folds`}
              d="M164 88 C161 101 162 117 161 130 C160 136 161 141 161 144 M145 103 C139 108 136 117 139 128 M124 119 C115 117 109 122 110 130 C111 136 106 137 103 135 M100 136 C108 136 110 142 111 147 M188 107 C193 110 198 114 193 117 L185 120 M212 113 C220 118 222 125 220 130 M227 141 C227 147 222 151 221 157 M138 176 C148 184 157 179 168 175 C178 171 188 167 198 168"
            />
          </defs>
          <path
            className="brain-surface"
            d="M173 196 C180 202 181 212 187 221 C189 225 195 227 197 222 C195 213 191 206 190 199 Z"
            fill={`url(#${id}-brain-stem)`}
          />
          <path
            className="brain-surface"
            d="M162 185 C172 198 187 208 202 206 C215 205 223 195 223 182 C212 179 203 175 194 179 C184 183 173 182 162 185 Z"
            fill={`url(#${id}-brain-cerebellum)`}
          />
          <use
            href={`#${id}-brain-shape`}
            fill={`url(#${id}-brain-cerebrum)`}
          />
          <use href={`#${id}-brain-shape`} fill={`url(#${id}-brain-light)`} />
          <path
            d="M166 88 C177 80 192 86 204 93 C219 102 227 115 231 132 C236 147 240 163 231 173"
            className="brain-volume-edge"
          />
          <use
            href={`#${id}-brain-shape`}
            stroke={`url(#${id}-brain-rim)`}
            strokeWidth="4"
            opacity=".45"
            filter={`url(#${id}-brain-soft)`}
          />
          <use
            href={`#${id}-brain-shape`}
            stroke={`url(#${id}-brain-rim)`}
            strokeWidth="1.7"
          />
          <path
            d="M120 170 C122 158 132 149 147 146 C157 143 164 146 173 144 C179 143 184 141 188 139 C184 147 190 152 199 157 C207 161 213 169 205 176 C195 181 184 185 174 188 C160 193 146 193 135 189 C125 187 117 180 120 170 Z"
            fill={`url(#${id}-brain-temporal)`}
          />
          <path
            className="brain-sulcus"
            d="M120 171 C121 158 133 149 147 146 C155 143 164 146 172 145 C179 145 184 142 188 139 M122 178 C128 190 148 193 162 189 C178 187 190 180 202 177 C211 182 225 183 233 177"
          />
          <use
            href={`#${id}-brain-folds`}
            stroke="#d88a45"
            strokeWidth="3.6"
            opacity=".13"
            filter={`url(#${id}-brain-soft)`}
            transform="translate(.5 1)"
          />
          <use
            href={`#${id}-brain-folds`}
            className="brain-sulcus"
            strokeWidth="3.4"
            opacity=".48"
            filter={`url(#${id}-brain-soft)`}
          />
          <use href={`#${id}-brain-folds`} className="brain-sulcus" />
          <path
            d="M87 143 C90 123 109 99 128 90 C139 84 150 82 156 85"
            stroke="var(--brain-cream)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".65"
            filter={`url(#${id}-brain-soft)`}
          />
        </svg>
      </div>
    </div>
  )
}
