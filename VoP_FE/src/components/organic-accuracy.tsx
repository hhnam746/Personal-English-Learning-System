import { useId, type CSSProperties, type PropsWithChildren } from 'react'
import { cn } from '@/shared/utils'
import { useOrganicMorph } from './organic-morph'

export function AccuracyBlob({
  children,
  className
}: PropsWithChildren<{ className?: string }>) {
  const id = useId().replace(/:/g, '')
  const containerRef = useOrganicMorph('accuracy')

  return (
    <div
      ref={containerRef}
      className={cn('organic-blob organic-blob--accuracy', className)}
      data-blob-variant="accuracy"
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
            <path d="M .116 .018 C .323 .010 .539 .038 .792 .019 C .918 .001 .985 .084 .992 .304 C .999 .554 .982 .799 .894 .900 C .808 .978 .583 .955 .368 .970 C .233 .981 .161 1.001 .091 .965 C .015 .927 .004 .756 .008 .515 C .012 .263 .027 .037 .116 .018 Z" />
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
          d="M .116 .018 C .323 .010 .539 .038 .792 .019 C .918 .001 .985 .084 .992 .304 C .999 .554 .982 .799 .894 .900 C .808 .978 .583 .955 .368 .970 C .233 .981 .161 1.001 .091 .965 C .015 .927 .004 .756 .008 .515 C .012 .263 .027 .037 .116 .018 Z"
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
          d="M .116 .018 C .323 .010 .539 .038 .792 .019 C .918 .001 .985 .084 .992 .304 C .999 .554 .982 .799 .894 .900 C .808 .978 .583 .955 .368 .970 C .233 .981 .161 1.001 .091 .965 C .015 .927 .004 .756 .008 .515 C .012 .263 .027 .037 .116 .018 Z"
          fill={`url(#${id}-blob-face)`}
        />
        <path
          className="organic-blob__body"
          d="M .116 .018 C .323 .010 .539 .038 .792 .019 C .918 .001 .985 .084 .992 .304 C .999 .554 .982 .799 .894 .900 C .808 .978 .583 .955 .368 .970 C .233 .981 .161 1.001 .091 .965 C .015 .927 .004 .756 .008 .515 C .012 .263 .027 .037 .116 .018 Z"
          fill={`url(#${id}-blob-volume)`}
        />
        <path
          className="organic-blob__thickness"
          d="M .116 .018 C .323 .010 .539 .038 .792 .019 C .918 .001 .985 .084 .992 .304 C .999 .554 .982 .799 .894 .900 C .808 .978 .583 .955 .368 .970 C .233 .981 .161 1.001 .091 .965 C .015 .927 .004 .756 .008 .515 C .012 .263 .027 .037 .116 .018 Z"
          stroke={`url(#${id}-blob-rim)`}
        />
        <path
          className="organic-blob__inner-edge"
          d="M .116 .018 C .323 .010 .539 .038 .792 .019 C .918 .001 .985 .084 .992 .304 C .999 .554 .982 .799 .894 .900 C .808 .978 .583 .955 .368 .970 C .233 .981 .161 1.001 .091 .965 C .015 .927 .004 .756 .008 .515 C .012 .263 .027 .037 .116 .018 Z"
          transform="translate(.012 .017) scale(.976 .952)"
          stroke={`url(#${id}-blob-rim)`}
        />
        <path
          className="organic-blob__outline"
          d="M .116 .018 C .323 .010 .539 .038 .792 .019 C .918 .001 .985 .084 .992 .304 C .999 .554 .982 .799 .894 .900 C .808 .978 .583 .955 .368 .970 C .233 .981 .161 1.001 .091 .965 C .015 .927 .004 .756 .008 .515 C .012 .263 .027 .037 .116 .018 Z"
          stroke={`url(#${id}-blob-rim)`}
        />
        <path
          className="organic-blob__highlight"
          d="M .008 .515 C .012 .263 .027 .037 .116 .018 C .323 .010 .539 .038 .792 .019"
          stroke={`url(#${id}-blob-highlight)`}
        />
        <path
          className="organic-blob__highlight organic-blob__highlight--lower"
          d="M .894 .900 C .808 .978 .583 .955 .368 .970 C .233 .981 .161 1.001 .091 .965"
          stroke={`url(#${id}-blob-rim)`}
        />
      </svg>
      <div className="organic-blob__content">{children}</div>
    </div>
  )
}
