import React from 'react'

const customIcons = {
  'i-hamburger': () => {
    return (
      <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="icon/hambuger" fill="#DB1E34">
          <g id="Group">
            <rect id="Rectangle-2" x="0" y="0" width="40" height="4"></rect>
            <rect id="Rectangle-2" x="0" y="10" width="30" height="4"></rect>
            <rect id="Rectangle-2" x="0" y="20" width="20" height="4"></rect>
          </g>
        </g>
      </g>
    )
  },
  'i-filter': () => {
    return (<path d="M16 9.107c-6.384-0.002-10.911-2.37-10.911-3.255-0.004-0.88 4.53-3.255 10.911-3.251 6.382-0.004 10.915 2.371 10.911 3.25 0 0.887-4.528 3.255-10.911 3.257zM16 0c-8.725 0-14.221 2.688-14.221 5.335v3.555c0 1.632 10.666 10.666 10.666 10.666v10.666c-0.002 1.216 1.778 1.778 3.555 1.778s3.557-0.562 3.555-1.778v-10.666c0 0 10.666-9.034 10.666-10.666v-3.555c0-2.647-5.497-5.335-14.221-5.335z"/>)
  },
  'i-add-to-list': () => {
    return (
      <g id="icon/light/add-to-list" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <path d="M6,11 L16,11 L16,14 L6,14 L6,11 Z M22,9 L22,5 L25,5 L25,9 L29,9 L29,12 L25,12 L25,16 L22,16 L22,12 L18,12 L18,9 L22,9 Z M6,16 L20,16 L20,19 L6,19 L6,16 Z M6,21 L22,21 L22,24 L6,24 L6,21 Z" id="Combined-Shape" fill="#FFFFFF"></path>
      </g>
    )
  },
}

export default customIcons