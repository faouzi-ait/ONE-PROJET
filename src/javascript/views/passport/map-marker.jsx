import React from 'react'

const CIRCLE_SIZE = 20
const STICK_SIZE = 8
const STICK_WIDTH = 3
const HOVER_COLOR = 'red'

const mapMarkerStyle = {
  // initially any map object has left top corner at lat lng coordinates
  // it's on you to set object origin to 0,0 coordinates
  position: 'absolute',
  width: CIRCLE_SIZE,
  height: CIRCLE_SIZE + STICK_SIZE,
  left: -CIRCLE_SIZE / 2,
  top: -(CIRCLE_SIZE + STICK_SIZE)
}

const mapMarkerCircleStyle = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: CIRCLE_SIZE,
  height: CIRCLE_SIZE,
  borderWidth: '3px',
  borderStyle: 'solid',
  borderRadius: CIRCLE_SIZE,
  textAlign: 'center',
  fontSize: 16,
  fontWeight: 'bold',
  padding: 0,
  cursor: 'pointer',
  boxShadow: '0 0 0 1px white'
}


const mapMarkerCircleStyleHover = {
  ...mapMarkerCircleStyle,
  borderColor: HOVER_COLOR,
  color: '#f44336'
}

const mapMarkerStickStyleShadow = {
  position: 'absolute',
  left: CIRCLE_SIZE / 2 - STICK_WIDTH / 2,
  top: CIRCLE_SIZE,
  width: STICK_WIDTH,
  height: STICK_SIZE,
  backgroundColor: '#f44336',
  boxShadow: '0 0 0 1px white'
}


const mapMarkerStickStyle = {
  position: 'absolute',
  left: CIRCLE_SIZE / 2 - STICK_WIDTH / 2,
  top: CIRCLE_SIZE + STICK_WIDTH,
  width: STICK_WIDTH,
  height: STICK_SIZE,
}

const mapMarkerStickStyleHover = {
  ...mapMarkerStickStyle,
  backgroundColor: HOVER_COLOR
}


const MapMarker = (props) => {

  const {text, zIndex, location} = props

  const style = {
    ...mapMarkerStyle,
    zIndex: props.$hover ? 1000 : zIndex
  };

  const circleStyle = props.$hover ? mapMarkerCircleStyleHover : mapMarkerCircleStyle
  const stickStyle = props.$hover ? mapMarkerStickStyleHover : mapMarkerStickStyle

  const circleClasses = `map__marker-circle map__marker-circle--${location['location-type']}`
  const stickClasses = `map__marker-stick--${location['location-type']}`

  return (
    <>
      <div style={style}>
        <div style={mapMarkerStickStyleShadow} />
        <div className={circleClasses} style={circleStyle}>
          {text}
        </div>
        <div className={stickClasses} style={stickStyle} />
      </div>
      { !props.$hover ? null: (
        <div className="map__tooltip" style={{

        }}>
          <div className="map__tooltip--line">{`${location['location-type'][0].toUpperCase()}${location['location-type'].slice(1)}`}</div>
          <div className="map__tooltip--line">{`${location['name']}`}</div>
          <div className="map__tooltip--address">{`${location['address']}`}</div>
        </div>
      )}
    </>
  )
}

export default MapMarker
