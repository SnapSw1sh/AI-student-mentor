const PNG_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAADQ0lEQVR4nO2dPWjUYByHq/UDWpCCTkIV7eCmFcSCFUQHcdEq0tXR1UkEFSkiKOLiKIhDR78QOigUdHYoFXVQN9EWVz9OHTwfeSGBeDZ4Sd7k/cjvgSyFS/J/H3rP5cjdDQwIIYQQQgghhBBCCCGEEEKIFQGGgX3AcWBaG9PJWpg1GW5SxG7gIfATkccP4AEwXqeIVcBF4FfuaYhezFqdr0vI1X8OJ/rlim0ZR/o+tMjjsM2nqte5hxH98tKWEPOqQdhhwoaQc5ZORsBZG0I2A/dcTxIBc8DWykIyYo4C711PFSDLwClrInqkDAHXdC3SF13gFrChFhk9YsaB5/2dVyt5YSXgBaWsBk4DX1xP7xGd5EXQYKMyesQo+nVEuyotjv5ybdGuSsui320s2j2LfBIYKfiYPcAC8bJgZiy4JiNmLQsLWGFHd4FPRf8tI41+p0y0k6fzD2YtCwvIEZLyFNhRIvrZfbQm2sA24HFmH9aFGL4DM8C6lkR/qcSzwxrgDPC1Z1+1CEl5CxyMOPrdMtFO3h1/lbPPWoUYfgOzwMbIrvQXgb0lon0zEYkrISlVov+ZeKL9PxoTkvIs4OjPAVsqRts7ISFGf8litL0UEkr0uzVE22shPkd/saZoey/Et+h3KkT7o4XjeyOkavRnHUV7e8FoByckG/31DUV/ydwI3VC0gxTSVPS7DqIdtJA6o7/oKNrBC7Ed/Y7jaEcjJOUJMFbw/EaBR8k2WvCxY8kxmyI4IaWjXzLa32iWIIVko3/IioG/55msMdpRC8lGf5OFOZqIdvRCSkffUbRbI6TUlX4NV9pViU5IX9EH1jqKdiuFpJiP2U3mRNvXj+BFLSSN/rz56HGyzSd/85XohYSGhHiGhHiGhHiGhHiGhHiGhHiGhHiGhHiGhHiGhHiGhHiGhHiGhHiGhHiGhHiGhMQo5I7rKSLitg0hl11PEREzNoQccD1FROy3IWQQeOd6kgh4Y+2b5oATrqeJgGNWZGSk3HA9UcBctyoj8x3wlxzfrBwaZq0umLWzLiQjZlfygy7mlk6xMmZt7gM7axOR85NHE8CUBz81NO3JNpWsyVBjIoQQQgghhBBCCCGEEEIIIQbC4g+8OOdVavgCtgAAAABJRU5ErkJggg==';

export function MailSentIcon({ className }) {
  return (
    <svg
      className={className}
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      aria-hidden="true"
    >
      <g filter="url(#filter0_d_230_193)">
        <g clipPath="url(#clip0_230_193)">
          <rect x="20" y="20" width="80" height="80" rx="40" fill="#C7C8CA" />
          <rect x="33.5" y="19" width="53" height="82" fill="url(#pattern0_230_193)" />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_230_193"
          x="0"
          y="0"
          width="120"
          height="120"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="20" operator="dilate" in="SourceAlpha" result="effect1_dropShadow_230_193" />
          <feOffset />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_230_193" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_230_193" result="shape" />
        </filter>
        <pattern id="pattern0_230_193" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#image0_230_193" transform="matrix(0.01 0 0 0.00646341 0 0.176829)" />
        </pattern>
        <clipPath id="clip0_230_193">
          <rect x="20" y="20" width="80" height="80" rx="40" fill="white" />
        </clipPath>
        <image id="image0_230_193" width="100" height="100" preserveAspectRatio="none" xlinkHref={PNG_DATA_URI} />
      </defs>
    </svg>
  );
}
