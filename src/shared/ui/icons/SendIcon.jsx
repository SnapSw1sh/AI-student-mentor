const SEND_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAD6ElEQVR4nO2dP4icRRjGJ5pCEV2T7Lx3gdOAjaAQi9y9716MXmNlqyfoed/77immFCwS0OLAykbQQCI2FoJNWktFEcXqWrXwXysKmk3hv1M+md29S27R5CTZnff75vnBU1xzzMyzM8/u/A0BAAAAAAAAAAAAAICWcZjX7qKerkWxs91e9dRCb/X23GUqlu5S9Whk/ZHE6h2lvyPbqyTPzeUuX1F0T6wdJdFLV5sxYczvxPoOSXU8d1mLgERf+S8z/sWcD7pij4cQDuQud2uJou/t15ArxtiXJPoCcmYKkNjF/2vIFeklYnvzMD+/MI2yFcmNGTLuMWJ/pP8z16s4d30az80wZI/YPotsq2F19dbcdWskN92QXWP0axJ7ce74s3fkrmOjmJohEzlzaNHuyV3XRjB9QyZyRvqSu86umZUhyBnPhsiuMd8gZzwZIrsaIGd8GVKPpH8Oy8PaC6XiyxC7ejgrM2fcGiIjRdFvi8oZ74bQRM4cPbF+b2gzDTKkHg9lf0XR92lpfTm0kcYZInu0FbmqwsrmwdAWGm5IvZMzaS9A5yG9OzSdNhhCbcqZlhlSj6R/p5yJy3YyNI12GmLNzZkCDKmToth3jciZUgyhHbFeTjkzv7xxLHikOENkImd6+nDwRLmGmM+cSd3XQYPUrnLm1DOHshkSRZ/I3RDkT4PI+nqunDkQxT500Ai1O7FuZ1mfObaitxHbOWL7OXsjiE9Fsc9nvz6zsnlwnvsPUK//WGRdT+NpZH1j/Cn5dDhnxPZr0cawfU9iL6XzNMELaZM1Lfbvi9I/lT41aQGJWF8jsXfTDvko+sVwXslBA9K0xHo5ir19ZHHj/tAU0reVuaXqwVGPq6rU48bf6i4Ol2hHPe63hhuzHcXectVjbpROO4z7pLj1/45z49LZzNxt5JKFXBnHej533V2yAENmQ8f5kBW5/2RoAx3nDb0/M+zjEDZvCZ5pQ0PT9YepbWK9cOTkxp3ZGho/DG02PwzTnBamTiz/1MnwE896YXhrg4NKU+GTi2n6/aPcFSaPyjH9Ps6A/JUXV8q3QDVcB8nfALWXfMi+hItNDuZsk0Oxhii2AZEHYaOcD0VsJXWjLTf5UK4hiuMITjTAgR0HijjS5kZbjcqHVhrCOBbtRYPG50MbDIm4WsOJGJfPOJDieiYnhgxwgdkYXPHnDFyC6QxcE+sMXKTsDFw17gxcxu8MPFfhDDzo0oInj4jtK2I7jSePpgCxvbzvoQmPgk2fuKTzJPbLNUzAs3mzpsv2SGT9YW9Q60/pYclk2MwLBEJIJ4CI+09H1jN4ehUAAAAAAAAAAAAAgFA8/wAnXd6okvyV/AAAAABJRU5ErkJggg==';

export function SendIcon({ className }) {
  return (
    <svg
      className={className}
      width="29"
      height="31"
      viewBox="0 0 29 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="29" height="31" fill="url(#pattern0_send)" />
      <defs>
        <pattern
          id="pattern0_send"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image0_send"
            transform="matrix(0.01 0 0 0.00935484 0 0.0322581)"
          />
        </pattern>
        <image
          id="image0_send"
          width="100"
          height="100"
          preserveAspectRatio="none"
          xlinkHref={SEND_IMAGE}
        />
      </defs>
    </svg>
  );
}
