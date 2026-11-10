"use strict";
(function (V) {
  // The same normalized path drives the CSS clip and the visible SVG edge.
  // Content stays in an independent HTML layer and is never scaled or blurred.
  const shapes = {
    summary: {
      outline:
        "M .355 .018 C .473 .004 .507 .079 .641 .133 C .766 .184 .887 .177 .949 .377 C .997 .546 .995 .724 .914 .843 C .845 .945 .750 .920 .647 .928 C .533 .938 .490 .996 .364 .971 C .214 .935 .116 .865 .061 .714 C .006 .538 .003 .332 .082 .176 C .139 .072 .241 .030 .355 .018 Z",
      upper:
        "M .082 .176 C .139 .072 .241 .030 .355 .018 C .473 .004 .507 .079 .641 .133",
      lower:
        "M .914 .843 C .845 .945 .750 .920 .647 .928 C .533 .938 .490 .996 .364 .971",
    },
    accuracy: {
      outline:
        "M .116 .018 C .323 .010 .539 .038 .792 .019 C .918 .001 .985 .084 .992 .304 C .999 .554 .982 .799 .894 .900 C .808 .978 .583 .955 .368 .970 C .233 .981 .161 1.001 .091 .965 C .015 .927 .004 .756 .008 .515 C .012 .263 .027 .037 .116 .018 Z",
      upper:
        "M .008 .515 C .012 .263 .027 .037 .116 .018 C .323 .010 .539 .038 .792 .019",
      lower:
        "M .894 .900 C .808 .978 .583 .955 .368 .970 C .233 .981 .161 1.001 .091 .965",
    },
    brain: {
      outline:
        "M .730 .026 C .881 .005 .982 .136 .970 .301 C .960 .468 .862 .568 .833 .730 C .810 .891 .733 .983 .610 .958 C .488 .933 .474 .799 .364 .734 C .250 .666 .090 .673 .048 .558 C .002 .432 .116 .305 .253 .197 C .388 .090 .568 .049 .730 .026 Z",
      upper:
        "M .253 .197 C .388 .090 .568 .049 .730 .026 C .881 .005 .982 .136 .970 .301",
      lower:
        "M .833 .730 C .810 .891 .733 .983 .610 .958 C .488 .933 .474 .799 .364 .734",
    },
  };
  let instance = 0;

  V.organicBlob = function ({
    variant = "summary",
    content = "",
    className = "",
    tag = "div",
    labelledBy = "",
    decorative = false,
  } = {}) {
    if (!["summary", "accuracy", "brain"].includes(variant))
      throw new RangeError("Unknown organic blob variant");
    if (!["div", "section", "aside"].includes(tag))
      throw new TypeError("Invalid blob element");
    const id = `vop-blob-${++instance}`;
    const shape = shapes[variant];
    const a = V.escape;
    return `<${tag} class="organic-blob organic-blob--${variant} ${a(className)}" data-blob-variant="${variant}" style="--blob-clip:url(#${id}-clip)"${labelledBy ? ` aria-labelledby="${a(labelledBy)}"` : ""}${decorative ? ' aria-hidden="true"' : ""}>
      <svg class="organic-blob__defs" width="1" height="1" aria-hidden="true" focusable="false"><defs>
        <clipPath id="${id}-clip" clipPathUnits="objectBoundingBox"><path d="${shape.outline}"/></clipPath>
      </defs></svg>
      ${variant === "summary" ? `<svg class="organic-blob__accent" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}-accent" x1="0" y1=".6" x2=".3" y2="1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffe2a1"/><stop offset=".32" stop-color="#ff9f24"/><stop offset=".6" stop-color="#fd720a"/><stop offset="1" stop-color="#ffc461"/></linearGradient></defs><path d="M .086 .553 C .012 .565 .006 .703 .056 .821 C .108 .942 .246 .992 .333 .931 C .413 .876 .297 .815 .231 .719 C .176 .639 .159 .558 .086 .553 Z" fill="url(#${id}-accent)" stroke="rgba(255,243,212,.65)" stroke-width="1.2" vector-effect="non-scaling-stroke"/></svg>` : ""}
      <svg class="organic-blob__shadow" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs><filter id="${id}-shadow" x="-.2" y="-.2" width="1.4" height="1.5"><feDropShadow dx="0" dy=".025" stdDeviation=".022" flood-color="#9c6d50" flood-opacity=".10"/></filter></defs><path d="${shape.outline}" fill="var(--blob-shadow-fill)" filter="url(#${id}-shadow)"/></svg>
      <div class="organic-blob__glass" aria-hidden="true"></div>
      <svg class="organic-blob__edge" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs>
        <radialGradient id="${id}-volume" cx=".47" cy=".42" r=".7" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="var(--blob-volume-center)"/><stop offset=".7" stop-color="var(--blob-volume-mid)"/><stop offset="1" stop-color="var(--blob-volume-edge)"/></radialGradient>
        <linearGradient id="${id}-face" x1="0" y1="0" x2="1" y2="1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="var(--blob-face-light)"/><stop offset=".45" stop-color="var(--blob-face-peach)"/><stop offset="1" stop-color="var(--blob-face-light)"/></linearGradient>
        <linearGradient id="${id}-rim" x1="0" y1="0" x2="1" y2="1" gradientUnits="userSpaceOnUse"><stop class="blob-rim-bright" offset="0"/><stop class="blob-rim-soft" offset=".43"/><stop class="blob-rim-faint" offset=".7"/><stop class="blob-rim-soft" offset="1"/></linearGradient>
        <linearGradient id="${id}-highlight" x1="0" y1="0" x2="1" y2=".65" gradientUnits="userSpaceOnUse"><stop class="blob-rim-bright" offset="0"/><stop class="blob-rim-soft" offset=".6"/><stop class="blob-rim-faint" offset="1"/></linearGradient>
      </defs><path class="organic-blob__body" d="${shape.outline}" fill="url(#${id}-face)"/><path class="organic-blob__body" d="${shape.outline}" fill="url(#${id}-volume)"/><path class="organic-blob__thickness" d="${shape.outline}" stroke="url(#${id}-rim)"/><path class="organic-blob__inner-edge" d="${shape.outline}" transform="translate(.012 .017) scale(.976 .952)" stroke="url(#${id}-rim)"/><path class="organic-blob__outline" d="${shape.outline}" stroke="url(#${id}-rim)"/><path class="organic-blob__highlight" d="${shape.upper}" stroke="url(#${id}-highlight)"/><path class="organic-blob__highlight organic-blob__highlight--lower" d="${shape.lower}" stroke="url(#${id}-rim)"/></svg>
      <div class="organic-blob__content">${content}</div>
    </${tag}>`;
  };

  V.brainIllustration = function () {
    // Hand-traced lateral silhouette and major sulci from the supplied reference.
    // Independent rounded volumes share a soft upper-left light source.
    const id = `vop-brain-${++instance}`;
    const cerebrum = "M164 88 C159 78 146 78 134 82 C119 86 108 96 100 106 C91 116 82 129 81 140 C78 150 82 160 87 165 C94 175 108 176 119 170 C122 184 136 191 151 190 C164 196 178 191 190 187 C203 180 214 181 225 180 C236 180 243 172 243 159 C244 146 239 133 235 121 C229 106 217 94 203 88 C189 80 173 76 164 88 Z";
    const temporal = "M120 170 C122 158 132 149 147 146 C157 143 164 146 173 144 C179 143 184 141 188 139 C184 147 190 152 199 157 C207 161 213 169 205 176 C195 181 184 185 174 188 C160 193 146 193 135 189 C125 187 117 180 120 170 Z";
    const folds = "M164 88 C161 101 162 117 161 130 C160 136 161 141 161 144 M145 103 C139 108 136 117 139 128 M124 119 C115 117 109 122 110 130 C111 136 106 137 103 135 M100 136 C108 136 110 142 111 147 M188 107 C193 110 198 114 193 117 L185 120 M212 113 C220 118 222 125 220 130 M227 141 C227 147 222 151 221 157 M138 176 C148 184 157 179 168 175 C178 171 188 167 198 168";
    return `<svg class="brain-illustration" viewBox="65 65 195 175" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="${id}-cerebrum" gradientUnits="userSpaceOnUse" cx="151" cy="145" r="106" gradientTransform="translate(151 145) scale(1 .72) translate(-151 -145)">
          <stop stop-color="var(--brain-base)"/>
          <stop offset=".28" stop-color="var(--brain-base)"/>
          <stop offset=".58" stop-color="var(--brain-top)"/>
          <stop offset=".86" stop-color="var(--brain-peach)"/>
          <stop offset="1" stop-color="var(--brain-cream)"/>
        </radialGradient>
        <radialGradient id="${id}-temporal" gradientUnits="userSpaceOnUse" cx="158" cy="141" r="70">
          <stop stop-color="var(--brain-base)"/>
          <stop offset=".55" stop-color="var(--brain-temporal-mid)"/>
          <stop offset="1" stop-color="var(--brain-temporal-edge)"/>
        </radialGradient>
        <linearGradient id="${id}-cerebellum" gradientUnits="userSpaceOnUse" x1="181" y1="178" x2="198" y2="209">
          <stop stop-color="var(--brain-base)"/>
          <stop offset=".55" stop-color="var(--brain-top)"/>
          <stop offset="1" stop-color="var(--brain-temporal-edge)"/>
        </linearGradient>
        <linearGradient id="${id}-stem" gradientUnits="userSpaceOnUse" x1="177" y1="198" x2="195" y2="222">
          <stop stop-color="var(--brain-top)"/>
          <stop offset="1" stop-color="var(--brain-cream)"/>
        </linearGradient>
        <linearGradient id="${id}-rim" gradientUnits="userSpaceOnUse" x1="119" y1="83" x2="223" y2="184">
          <stop stop-color="#fffdf1"/>
          <stop offset=".52" stop-color="var(--brain-edge)"/>
          <stop offset="1" stop-color="#ffe8c6" stop-opacity=".65"/>
        </linearGradient>
        <radialGradient id="${id}-light" gradientUnits="userSpaceOnUse" cx="133" cy="90" r="75">
          <stop stop-color="#fffff5" stop-opacity=".45"/>
          <stop offset=".46" stop-color="#fff5d8" stop-opacity=".13"/>
          <stop offset="1" stop-color="#fff5d8" stop-opacity="0"/>
        </radialGradient>
        <filter id="${id}-soft" x="-15%" y="-15%" width="130%" height="130%"><feGaussianBlur stdDeviation="1.1"/></filter>
        <path id="${id}-shape" d="${cerebrum}"/>
        <path id="${id}-folds" d="${folds}"/>
      </defs>
      <path class="brain-surface" d="M173 196 C180 202 181 212 187 221 C189 225 195 227 197 222 C195 213 191 206 190 199 Z" fill="url(#${id}-stem)"/>
      <path class="brain-surface" d="M162 185 C172 198 187 208 202 206 C215 205 223 195 223 182 C212 179 203 175 194 179 C184 183 173 182 162 185 Z" fill="url(#${id}-cerebellum)"/>
      <use href="#${id}-shape" fill="url(#${id}-cerebrum)"/>
      <use href="#${id}-shape" fill="url(#${id}-light)"/>
      <path d="M166 88 C177 80 192 86 204 93 C219 102 227 115 231 132 C236 147 240 163 231 173" class="brain-volume-edge"/>
      <use href="#${id}-shape" stroke="url(#${id}-rim)" stroke-width="4" opacity=".45" filter="url(#${id}-soft)"/>
      <use href="#${id}-shape" stroke="url(#${id}-rim)" stroke-width="1.7"/>
      <path d="${temporal}" fill="url(#${id}-temporal)"/>
      <path class="brain-sulcus" d="M120 171 C121 158 133 149 147 146 C155 143 164 146 172 145 C179 145 184 142 188 139 M122 178 C128 190 148 193 162 189 C178 187 190 180 202 177 C211 182 225 183 233 177"/>
      <use href="#${id}-folds" stroke="#d88a45" stroke-width="3.6" opacity=".13" filter="url(#${id}-soft)" transform="translate(.5 1)"/>
      <use href="#${id}-folds" class="brain-sulcus" stroke-width="3.4" opacity=".48" filter="url(#${id}-soft)"/>
      <use href="#${id}-folds" class="brain-sulcus"/>
      <path d="M87 143 C90 123 109 99 128 90 C139 84 150 82 156 85" stroke="var(--brain-cream)" stroke-width="4" stroke-linecap="round" opacity=".65" filter="url(#${id}-soft)"/>
    </svg>`;
  };
})(VOP);
