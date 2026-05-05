const PNG_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEUElEQVR4nO2dW6gVVRjHfycveYssELqAZhIEPdUJy0KrF/XBUBDBS4aV2hV7iDjVUyBET74I3Sixhx7KoAfJCEEhL0EdvGQimRcoCApFSNS0gzsWfJsOhzWzz5m9Zu9vZv9/sF4Os9ea7/udPTNrz7qAEEIIIYQQQgghhBBCCCEccifwGLAG2NijZY3lIOSiK0wEXgYGgetAQ4WG5WLQcjOhUzIeAk45CL7hvPwKzC1bxnLgioNgGxUpVyxnpdAPXHYQZKOCUh5OLeNG4ExGg4eAN4GVwIoeLSstB4cycnTa7rvJeDXSyFVgA9CXsqGKE3LxvOVmZL42pWzop0gDz6VsoGZsiOTraKrK74pU/kOqymv8TRmM5G1misoXRSp+LUXFNef1SN4Wpqh4XaTipSkqrjnLInkLuWybFyIVL05Rcc1ZHMlbyGXbSEgxJMQZEuIMCXGGhDhDQpwhIc6QEGe4EHIfcAT4B9gBTKd+TAd2AkP2e9W9noUcHHHcfmAK9WGKxTQ8xn2ehZyLHBv+m8ZTfcZbLCPj+8uzkA8jx4ayveIvsm6wGGKxfeBZyGTgu4wT/8QCqxp9wHsZMX0PTPUsJHAzcLgmUvpyZBwDbsn5rBsh2Ai+sxmBfFQRKeOAjzNiCLHd0eLzroQEZuWMVPkKmIRfJgKfZ5z7b8CcUdThTkgrKXvt8uaNacC3bcpwK6SVlGPdHKAc4bacsVVjkeFaSFPKiYxAfwfm0X36c+57JwqMGHEtJHArcCAj4H+BAbrHxozBbc0hTzMK1OleCPbM/nVG4A3gs5zn+jII/aZtOeezG7ipYN2VEILNm8hLws/AA5TPg8DxnPPY1uYcj8oIafIKcC3nErbZBnmnJjxuv2NtxNq+ahNu2qVyQgKPAn/k/JeestHlqXjSRqJntfcn8ESitiopBOvxZt3sG1b22By+ojxu/Z68NsLP6LcnjKuyQpo943ftpU9e0sK7iKfsZtyKcMzaUcgesktY6jmBlRbS5BHgZIsEhnLB3ki+BMwH7rEy367/X9oxrer5pYzZTXUS0vy2hAlCF0eR0KIlTM17u+Tf02ojZHjv/tOcp6Ei5Zq9aEoyT6PXhDS5295EtvON+Rt4H5hN56itkCahB/808I0leDQSdtmNvZO9/54RMvLlUejNPwO8AWyxMmB/u9+O6SY9JaQKSIgzJMQZEuIMCXGGhDhDQpwhIc6QEGdIiDMkxBkS4gwJcYaEOENCekWIFjBzJkRL/BVjdSRvqyhxEcwqz6rtBF9E8javzGVi16eqvIYsiWxScD7lYspZCymHRYP1TfmfPrvnXorkaysdWmo8rG3yll0fV/RoWWU5yJoOfr7gpJ+W21RoZwTGXIbKfCrVdhWMeaTks5TMXNuspNvBNpyXMzb/pSNMsJHnP2rLI4aX65aTF1NvTzHWCTcLrCPUy5uCLUg84UcIIYQQQgghhBBCCCGEECThP/GAUfVFJW/bAAAAAElFTkSuQmCC';

export function EmailIcon({ className }) {
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
      <rect width="21" height="18" fill="url(#pattern_email)" fillOpacity="0.5" />
      <defs>
        <pattern id="pattern_email" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#image_pattern_email" transform="matrix(0.00857143 0 0 0.01 0.0714286 0)" />
        </pattern>
        <image
          id="image_pattern_email"
          width="100"
          height="100"
          preserveAspectRatio="none"
          xlinkHref={PNG_DATA_URI}
        />
      </defs>
    </svg>
  );
}
