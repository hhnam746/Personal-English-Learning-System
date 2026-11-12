import { useId, type CSSProperties, type PropsWithChildren } from 'react'
import { cn } from '@/shared/utils'

export function SummaryBlob({
  children,
  className
}: PropsWithChildren<{ className?: string }>) {
  const id = useId().replace(/:/g, '')
  return (
    <div
      className={cn('organic-blob organic-blob--summary', className)}
      data-blob-variant="summary"
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
            <path d="M .355 .018 C .473 .004 .507 .079 .641 .133 C .766 .184 .887 .177 .949 .377 C .997 .546 .995 .724 .914 .843 C .845 .945 .750 .920 .647 .928 C .533 .938 .490 .996 .364 .971 C .214 .935 .116 .865 .061 .714 C .006 .538 .003 .332 .082 .176 C .139 .072 .241 .030 .355 .018 Z" />
          </clipPath>
        </defs>
      </svg>
      <svg
        className="organic-blob__accent"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient
            id={`${id}-blob-accent`}
            x1="0"
            y1=".6"
            x2=".3"
            y2="1"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#ffe2a1" />
            <stop offset=".32" stopColor="#ff9f24" />
            <stop offset=".6" stopColor="#fd720a" />
            <stop offset="1" stopColor="#ffc461" />
          </linearGradient>
        </defs>
        <path
          d="M .086 .553 C .012 .565 .006 .703 .056 .821 C .108 .942 .246 .992 .333 .931 C .413 .876 .297 .815 .231 .719 C .176 .639 .159 .558 .086 .553 Z"
          fill={`url(#${id}-blob-accent)`}
          stroke="rgba(255,243,212,.65)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
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
          d="M .355 .018 C .473 .004 .507 .079 .641 .133 C .766 .184 .887 .177 .949 .377 C .997 .546 .995 .724 .914 .843 C .845 .945 .750 .920 .647 .928 C .533 .938 .490 .996 .364 .971 C .214 .935 .116 .865 .061 .714 C .006 .538 .003 .332 .082 .176 C .139 .072 .241 .030 .355 .018 Z"
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
          d="M .355 .018 C .473 .004 .507 .079 .641 .133 C .766 .184 .887 .177 .949 .377 C .997 .546 .995 .724 .914 .843 C .845 .945 .750 .920 .647 .928 C .533 .938 .490 .996 .364 .971 C .214 .935 .116 .865 .061 .714 C .006 .538 .003 .332 .082 .176 C .139 .072 .241 .030 .355 .018 Z"
          fill={`url(#${id}-blob-face)`}
        />
        <path
          className="organic-blob__body"
          d="M .355 .018 C .473 .004 .507 .079 .641 .133 C .766 .184 .887 .177 .949 .377 C .997 .546 .995 .724 .914 .843 C .845 .945 .750 .920 .647 .928 C .533 .938 .490 .996 .364 .971 C .214 .935 .116 .865 .061 .714 C .006 .538 .003 .332 .082 .176 C .139 .072 .241 .030 .355 .018 Z"
          fill={`url(#${id}-blob-volume)`}
        />
        <path
          className="organic-blob__thickness"
          d="M .355 .018 C .473 .004 .507 .079 .641 .133 C .766 .184 .887 .177 .949 .377 C .997 .546 .995 .724 .914 .843 C .845 .945 .750 .920 .647 .928 C .533 .938 .490 .996 .364 .971 C .214 .935 .116 .865 .061 .714 C .006 .538 .003 .332 .082 .176 C .139 .072 .241 .030 .355 .018 Z"
          stroke={`url(#${id}-blob-rim)`}
        />
        <path
          className="organic-blob__inner-edge"
          d="M .355 .018 C .473 .004 .507 .079 .641 .133 C .766 .184 .887 .177 .949 .377 C .997 .546 .995 .724 .914 .843 C .845 .945 .750 .920 .647 .928 C .533 .938 .490 .996 .364 .971 C .214 .935 .116 .865 .061 .714 C .006 .538 .003 .332 .082 .176 C .139 .072 .241 .030 .355 .018 Z"
          transform="translate(.012 .017) scale(.976 .952)"
          stroke={`url(#${id}-blob-rim)`}
        />
        <path
          className="organic-blob__outline"
          d="M .355 .018 C .473 .004 .507 .079 .641 .133 C .766 .184 .887 .177 .949 .377 C .997 .546 .995 .724 .914 .843 C .845 .945 .750 .920 .647 .928 C .533 .938 .490 .996 .364 .971 C .214 .935 .116 .865 .061 .714 C .006 .538 .003 .332 .082 .176 C .139 .072 .241 .030 .355 .018 Z"
          stroke={`url(#${id}-blob-rim)`}
        />
        <path
          className="organic-blob__highlight"
          d="M .082 .176 C .139 .072 .241 .030 .355 .018 C .473 .004 .507 .079 .641 .133"
          stroke={`url(#${id}-blob-highlight)`}
        />
        <path
          className="organic-blob__highlight organic-blob__highlight--lower"
          d="M .914 .843 C .845 .945 .750 .920 .647 .928 C .533 .938 .490 .996 .364 .971"
          stroke={`url(#${id}-blob-rim)`}
        />
      </svg>
      <div className="organic-blob__content">{children}</div>
    </div>
  )
}
