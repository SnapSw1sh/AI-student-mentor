const IMAGE_HREF =
  'data:image/png;base64,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';

export function SidebarUserIcon({ className }) {
  return (
    <svg
      className={className}
      width="20"
      height="19"
      viewBox="0 0 20 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      aria-hidden="true"
    >
      <rect width="20" height="19" fill="url(#pattern_sidebar_user)" />
      <defs>
        <pattern
          id="pattern_sidebar_user"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image_sidebar_user"
            transform="matrix(0.0095 0 0 0.01 0.025 0)"
          />
        </pattern>
        <image
          id="image_sidebar_user"
          width="100"
          height="100"
          preserveAspectRatio="none"
          xlinkHref={IMAGE_HREF}
        />
      </defs>
    </svg>
  );
}
