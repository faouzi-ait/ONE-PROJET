import React, { SVGProps } from 'react'

const iconMap: IconMapType = {
  muted: props => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        {...props}
      >
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      </svg>
    )
  },
  'un-muted': props => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        {...props}
      >
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        <path d="M0 0h24v24H0z" fill="none" />
      </svg>
    )
  },
  close: props => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        {...props}
      >
        <path d="M8.9,7l4.7-4.6c0.5-0.5,0.5-1.4,0-2l0,0c-0.5-0.5-1.4-0.5-2,0L6.9,5.1L2.4,0.5c-0.5-0.5-1.4-0.5-1.9,0c-0.5,0.5-0.5,1.4,0,1.9L5,7l-4.6,4.6c-0.5,0.5-0.5,1.4,0,2l0,0c0.5,0.5,1.4,0.5,2,0L7,9l4.7,4.6c0.5,0.5,1.4,0.5,1.9,0c0.5-0.5,0.5-1.4,0-1.9L8.9,7z" />
      </svg>
    )
  },
  'banner-carousel-view': props => {
    return (
      <svg
        width="60px"
        height="88px"
        viewBox="0 0 60 88"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <defs>
          <rect id="path-1" x="0" y="0" width="4" height="9"></rect>
          <rect id="path-3" x="0" y="0" width="4" height="9"></rect>
          <rect id="path-5" x="0" y="0" width="4" height="9"></rect>
        </defs>
        <g
          id="icon/large/layout2"
          stroke="none"
          stroke-width="1"
          fill="none"
          fill-rule="evenodd"
        >
          <g id="Cut-programme" transform="translate(52.000000, 74.000000)">
            <mask id="mask-2" fill="white">
              <use xlinkHref="#path-1"></use>
            </mask>
            <g
              id="Mask"
              transform="translate(2.000000, 4.500000) scale(-1, 1) translate(-2.000000, -4.500000) "
            ></g>
            <rect
              id="Rectangle-Copy-8"
              stroke="#98A5B1"
              stroke-width="2"
              mask="url(#mask-2)"
              x="1"
              y="1"
              width="6"
              height="7"
              rx="3"
            ></rect>
          </g>
          <rect
            id="programme"
            stroke="#98A5B1"
            stroke-width="2"
            x="37"
            y="75"
            width="12"
            height="7"
            rx="3"
          ></rect>
          <rect
            id="programme"
            stroke="#98A5B1"
            stroke-width="2"
            x="21"
            y="75"
            width="12"
            height="7"
            rx="3"
          ></rect>
          <rect
            id="programme"
            stroke="#98A5B1"
            stroke-width="2"
            x="5"
            y="75"
            width="12"
            height="7"
            rx="3"
          ></rect>
          <rect
            id="Title"
            fill="#98A5B1"
            x="4"
            y="70"
            width="8"
            height="2"
          ></rect>
          <g id="Cut-programme" transform="translate(52.000000, 57.000000)">
            <mask id="mask-4" fill="white">
              <use xlinkHref="#path-3"></use>
            </mask>
            <g
              id="Mask"
              transform="translate(2.000000, 4.500000) scale(-1, 1) translate(-2.000000, -4.500000) "
            ></g>
            <rect
              id="Rectangle-Copy-8"
              stroke="#98A5B1"
              stroke-width="2"
              mask="url(#mask-4)"
              x="1"
              y="1"
              width="6"
              height="7"
              rx="3"
            ></rect>
          </g>
          <rect
            id="programme"
            stroke="#98A5B1"
            stroke-width="2"
            x="5"
            y="58"
            width="12"
            height="7"
            rx="3"
          ></rect>
          <rect
            id="programme"
            stroke="#98A5B1"
            stroke-width="2"
            x="21"
            y="58"
            width="12"
            height="7"
            rx="3"
          ></rect>
          <rect
            id="programme"
            stroke="#98A5B1"
            stroke-width="2"
            x="37"
            y="58"
            width="12"
            height="7"
            rx="3"
          ></rect>
          <rect
            id="Title"
            fill="#98A5B1"
            x="4"
            y="53"
            width="8"
            height="2"
          ></rect>
          <g id="Cut-programme" transform="translate(52.000000, 40.000000)">
            <mask id="mask-6" fill="white">
              <use xlinkHref="#path-5"></use>
            </mask>
            <g
              id="Mask"
              transform="translate(2.000000, 4.500000) scale(-1, 1) translate(-2.000000, -4.500000) "
            ></g>
            <rect
              id="Rectangle-Copy-8"
              stroke="#98A5B1"
              stroke-width="2"
              mask="url(#mask-6)"
              x="1"
              y="1"
              width="6"
              height="7"
              rx="3"
            ></rect>
          </g>
          <rect
            id="programme"
            stroke="#98A5B1"
            stroke-width="2"
            x="5"
            y="41"
            width="12"
            height="7"
            rx="3"
          ></rect>
          <rect
            id="programme"
            stroke="#98A5B1"
            stroke-width="2"
            x="21"
            y="41"
            width="12"
            height="7"
            rx="3"
          ></rect>
          <rect
            id="programme"
            stroke="#98A5B1"
            stroke-width="2"
            x="37"
            y="41"
            width="12"
            height="7"
            rx="3"
          ></rect>
          <rect
            id="Title"
            fill="#98A5B1"
            x="4"
            y="36"
            width="8"
            height="2"
          ></rect>
          <circle id="dot" fill="#98A5B1" cx="25.5" cy="25.5" r="1.5"></circle>
          <circle id="dot" fill="#98A5B1" cx="30.5" cy="25.5" r="1.5"></circle>
          <circle id="dot" fill="#98A5B1" cx="35.5" cy="25.5" r="1.5"></circle>
          <rect
            id="Banner"
            stroke="#98A5B1"
            stroke-width="2"
            x="5"
            y="5"
            width="50"
            height="26"
            rx="3"
          ></rect>
        </g>
      </svg>
    )
  },
  'grid-view': props => (
    <svg
      width="60px"
      height="88px"
      viewBox="0 0 60 88"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <title>icon/large/layout1</title>
      <desc>Created with Sketch.</desc>
      <g
        id="icon/large/layout1"
        stroke="none"
        stroke-width="1"
        fill="none"
        fill-rule="evenodd"
      >
        <rect
          id="programme"
          stroke="#98A5B1"
          stroke-width="2"
          x="5"
          y="71"
          width="14"
          height="11"
          rx="2"
        ></rect>
        <rect
          id="programme"
          stroke="#98A5B1"
          stroke-width="2"
          x="5"
          y="54"
          width="14"
          height="11"
          rx="2"
        ></rect>
        <rect
          id="programme"
          stroke="#98A5B1"
          stroke-width="2"
          x="5"
          y="37"
          width="14"
          height="11"
          rx="2"
        ></rect>
        <rect
          id="programme"
          stroke="#98A5B1"
          stroke-width="2"
          x="23"
          y="71"
          width="14"
          height="11"
          rx="2"
        ></rect>
        <rect
          id="programme"
          stroke="#98A5B1"
          stroke-width="2"
          x="23"
          y="54"
          width="14"
          height="11"
          rx="2"
        ></rect>
        <rect
          id="programme"
          stroke="#98A5B1"
          stroke-width="2"
          x="23"
          y="37"
          width="14"
          height="11"
          rx="2"
        ></rect>
        <rect
          id="programme"
          stroke="#98A5B1"
          stroke-width="2"
          x="41"
          y="71"
          width="14"
          height="11"
          rx="2"
        ></rect>
        <rect
          id="programme"
          stroke="#98A5B1"
          stroke-width="2"
          x="41"
          y="54"
          width="14"
          height="11"
          rx="2"
        ></rect>
        <rect
          id="programme"
          stroke="#98A5B1"
          stroke-width="2"
          x="41"
          y="37"
          width="14"
          height="11"
          rx="2"
        ></rect>
        <rect
          id="Banner"
          stroke="#98A5B1"
          stroke-width="2"
          x="5"
          y="5"
          width="50"
          height="26"
          rx="3"
        ></rect>
      </g>
    </svg>
  ),
}

type IconKeys =
  | 'muted'
  | 'un-muted'
  | 'banner-carousel-view'
  | 'grid-view'
  | 'close'

interface IconProps {
  width?: string
  height?: string
  viewBox?: string
}

type IconMapType = {
  [K in IconKeys]: React.FC<IconProps>
}

type SharedIconProps = {
  icon: IconKeys
} & SVGProps<any>

const SharedIcon: React.FC<SharedIconProps & IconProps> = ({
  icon,
  ...props
}) => {
  if (iconMap[icon]) {
    const Icon = iconMap[icon]
    return <Icon {...props} />
  }
  throw new Error(`${icon} not found in iconMap.`)
}

export default SharedIcon
