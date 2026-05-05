const PNG_DATA_URI = 'data:image/png;base64,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';

export function EyeOpenIcon({ className }) {
  return (
    <svg
      className={className}
      width="21"
      height="18"
      viewBox="0 0 21 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      aria-hidden="true"
    >
      <rect width="21" height="18" fill="url(#pattern_eye_open)" fillOpacity="0.6" />
      <defs>
        <pattern id="pattern_eye_open" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#image_pattern_eye_open" transform="matrix(0.00857143 0 0 0.01 0.0714286 0)" />
        </pattern>
        <image
          id="image_pattern_eye_open"
          width="100"
          height="100"
          preserveAspectRatio="none"
          xlinkHref={PNG_DATA_URI}
        />
      </defs>
    </svg>
  );
}
