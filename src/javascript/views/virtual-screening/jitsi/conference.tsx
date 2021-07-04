import React, { useEffect, useState, useRef } from 'react'
import uuid from 'uuid/v4'
import $ from 'jquery'

import 'stylesheets/core/components/jitsi'

import { UserDetailsType, UserStatusType } from 'javascript/views/virtual-screening/use-sockets'
import useConferenceState from 'javascript/views/virtual-screening/jitsi/use-conference-state'

import LocalTrack from 'javascript/views/virtual-screening/jitsi/local-track'
import RemoteTrack from 'javascript/views/virtual-screening/jitsi/remote-track'
import NoVideoFeed from 'javascript/views/virtual-screening/jitsi/no-video-feed'
import useTheme from 'javascript/utils/theme/useTheme'
import { VirtualMeetingAttendeeType, VirtualMeetingType } from 'javascript/types/ModelTypes'

declare global {
  interface Window {
    jitsiGlobals: {
      remoteTracks?: any[]
      activeConnection?: any
      activeRoom?: any
    }
    JitsiMeetJS: any
    $: any
  }
}

export type ConferenceViewType = 'conference' | 'cinema' | 'side-panel' | 'solo'

interface Props {
  fetchJitsiJwt: (attendeeId: string) => Promise<Partial<VirtualMeetingAttendeeType>>
  meeting: VirtualMeetingType
  status: UserStatusType
  userDetails: UserDetailsType
  view: ConferenceViewType
  waitingRoomMessage?: () => JSX.Element
}

const JitsiConference: React.FC<Props> = ({
  children,
  fetchJitsiJwt,
  meeting,
  status,
  userDetails,
  view,
  waitingRoomMessage = () => null
}) => {

  const conferenceState = useConferenceState()
  const { features } = useTheme()

  const JITSI_SERVER_HOST = features.virtualMeetings.jitsiHost

  const sidePanelRef = useRef()
  const [jitsiLoaded, setJitsiLoaded] = useState(false)
  const [activeRoomId, setActiveRoomId] = useState(null)
  const [defaultMicId, setDefaultMicId] = useState('')
  const [defaultVideoId, setDefaultVideoId] = useState('')
  const [localTrackReady, setLocalTrackReady] = useState(false)
  const [isJitsiAvailable, setIsJitsiAvailable] = useState(false)
  const [remoteTrackIds, setRemoteTrackIds] = useState([])

  const [myUserId, setMyUserId] = useState('')
  const [mainViewParticipantId, setMainViewParticipantId] = useState('')
  const [currentSpeakerId, setCurrentSpeakerId] = useState('')
  const [selectedParticipants, setSelectedParticipants] = useState([])

  const [lastError, setLastError] = useState('')
  const [devicesLoaded, setDevicesLoaded] = useState(false)

  const scriptRef = useRef<HTMLScriptElement>()

  const roomId = meeting?.['room-key']
  const conferenceIsDisabled = !meeting?.['conference']

  useEffect(() => {

    if (conferenceIsDisabled) return
    /* these are kept on the window object
      - The main pitfall in react is to not use any Jitsi API ojects as state or props
      - https://github.com/fpw23/telimed
    */


    window.jitsiGlobals = {}
    window.jitsiGlobals.remoteTracks = []
    window.jitsiGlobals.activeConnection = null
    window.jitsiGlobals.activeRoom = null
    window.$ = $

    const script = document.createElement('script')
    script.id = 'lib-jitsi-meet'
    script.src = `//${JITSI_SERVER_HOST}/libs/lib-jitsi-meet.min.js`
    scriptRef.current = script
    document.body.appendChild(script)

    const waitForJitsiMeetJS = new Promise<void>((resolveJitsiMeetJS, rejectJitsiMeetJS) => {
      const waitForIt = (i = 0) => {
        if (i > 15) return rejectJitsiMeetJS()
        setTimeout(() => window.JitsiMeetJS ? resolveJitsiMeetJS() : waitForIt(i + 1), 500)
      }
      waitForIt()
    })

    waitForJitsiMeetJS
    .then(() => {
      setJitsiLoaded(true)
    })
    .catch((error) => {
      setLastError('Cannot contact conferencing server for connection.')
    })

    return () => {
      onDisconnect()
      scriptRef.current.parentNode.removeChild(scriptRef.current)
      setTimeout(() => { //allows componentWillUnmount functions from children to run before removing global variables
        delete window.$
        delete window.jitsiGlobals
      }, 500)
    }
  }, [roomId])

  useEffect(() => {
    if (!window.JitsiMeetJS || !jitsiLoaded) return
    window.JitsiMeetJS.init()
    setTimeout(() => {
      setIsJitsiAvailable(true)
    }, 1000)
  }, [window.JitsiMeetJS, jitsiLoaded])

  useEffect(() => {
    if (isJitsiAvailable) {
      window.JitsiMeetJS.setLogLevel(window.JitsiMeetJS.logLevels.ERROR)
      setDefaultDevices()
    }
  }, [isJitsiAvailable])

  const updateRemoteTrackIds = (remoteTracks) => {
    setRemoteTrackIds(remoteTracks.map((rt) => ({
      id: rt.id,
      participantId: rt.participantId
    })))
  }

  const setDefaultDevices = () => {
    const devicesFound = window.JitsiMeetJS.mediaDevices.isDeviceListAvailable()
    if (devicesFound) {
      window.JitsiMeetJS.mediaDevices.enumerateDevices((devices) => {
        const findDefaultDevice = (deviceList, type) => {
          return deviceList.find((device) => device.type === type)?.id || 'none'
        }
        const newDeviceList = devices.map((device) => ({
          name: device.label,
          id: device.deviceId,
          type: device.kind
        }))
        setDefaultMicId(findDefaultDevice(newDeviceList, 'audioinput'))
        setDefaultVideoId(findDefaultDevice(newDeviceList, 'videoinput'))
        setDevicesLoaded(true)
      })
    } else {
      setLastError('JitsiMeetJS.mediaDevices.isDeviceListAvailable: false')
    }
  }

  const onTrackAdded = (track) => {
    if (!window.jitsiGlobals?.remoteTracks) return
    if (track.isLocal()) {
      return
    }
    const newTrackId = track.getId()
    if (remoteTrackIds.find((rt) => rt.id === newTrackId)) {
      return /* remote track already exists */
    }
    const trackInfo = {
      id: newTrackId,
      participantId: track.getParticipantId(),
      type: track.getType(),
      track: track
    }
    window.jitsiGlobals.remoteTracks.push(trackInfo)
    updateRemoteTrackIds(window.jitsiGlobals.remoteTracks)
  }

  const onTrackRemoved = (track) => {
    if (!window.jitsiGlobals?.remoteTracks) return
    if (track.isLocal() === true) {
      return
    }
    const trackId = track.getId()
    window.jitsiGlobals.remoteTracks = window.jitsiGlobals.remoteTracks.filter((rt) => rt.id !== trackId)
    updateRemoteTrackIds(window.jitsiGlobals.remoteTracks)
  }

  const onSpeakerChanged = (newSpeakerId) => {
    setCurrentSpeakerId(newSpeakerId)
    if (newSpeakerId !== myUserId) {
      setMainViewParticipantId(newSpeakerId)
    }
  }

  useEffect(() => {
    if (currentSpeakerId) {
      const participants = [...selectedParticipants]
      participants.unshift(currentSpeakerId)
      setSelectedParticipants(participants.slice(0, 2))
      if (window.jitsiGlobals?.activeRoom && participants.length) {
        window.jitsiGlobals.activeRoom.selectParticipants(participants)
      }
    }
  }, [currentSpeakerId])

  const onConnectionSuccess = () => {
    try {
      window.jitsiGlobals.activeRoom = window.jitsiGlobals.activeConnection.initJitsiConference(roomId, {
        openBridgeChannel: true,
      })
      window.jitsiGlobals.activeRoom.addEventListener(window.JitsiMeetJS.events.conference.TRACK_ADDED, onTrackAdded)
      window.jitsiGlobals.activeRoom.addEventListener(window.JitsiMeetJS.events.conference.TRACK_REMOVED, onTrackRemoved)
      window.jitsiGlobals.activeRoom.addEventListener(window.JitsiMeetJS.events.conference.DOMINANT_SPEAKER_CHANGED, onSpeakerChanged)
      window.jitsiGlobals.activeRoom.setDisplayName(userDetails.name)
      setMyUserId(window.jitsiGlobals.activeRoom.p2pDominantSpeakerDetection.myUserID)
      conferenceState.joinedConference()
      window.jitsiGlobals.activeRoom.join()
      setLastError('')
      setActiveRoomId(uuid())
    } catch (error) {
      setLastError(error.message)
    }
  }

  const onConnectionFailed = (a, b, c, d) => {
    setLastError(`${a}: ${b}`)
    setActiveRoomId(null)
  }

  const onConnectionDisconnect = () => {
    window.jitsiGlobals.activeConnection.removeEventListener(window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess)
    window.jitsiGlobals.activeConnection.removeEventListener(window.JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed)
    window.jitsiGlobals.activeConnection.removeEventListener(window.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, onConnectionDisconnect)
    window.jitsiGlobals.activeRoom.removeEventListener(window.JitsiMeetJS.events.conference.TRACK_ADDED, onTrackAdded)
    window.jitsiGlobals.activeRoom.removeEventListener(window.JitsiMeetJS.events.conference.TRACK_REMOVED, onTrackRemoved)
    window.jitsiGlobals.activeRoom.removeEventListener(window.JitsiMeetJS.events.conference.DOMINANT_SPEAKER_CHANGED, onSpeakerChanged)
  }

  const onConnect = (jitsiJwt) => {
    conferenceState.resetState()
    window.jitsiGlobals.activeConnection = new window.JitsiMeetJS.JitsiConnection(null, jitsiJwt, {
      hosts: {
         domain: 'meet.jitsi',
         muc: 'muc.meet.jitsi',
      },
      serviceUrl: `wss://${JITSI_SERVER_HOST}/xmpp-websocket?room=${roomId}`,
    })
    window.jitsiGlobals.activeConnection.addEventListener(window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess)
    window.jitsiGlobals.activeConnection.addEventListener(window.JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed)
    window.jitsiGlobals.activeConnection.addEventListener(window.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, onConnectionDisconnect)
    window.jitsiGlobals.activeConnection.connect()
  }

  useEffect(() => {
    if (window.jitsiGlobals?.activeRoom && status !== 'active' && status !== 'host') {
      onDisconnect()
    } else if (roomId && localTrackReady) {
      setDefaultDevices()
      if (status === 'host' || status === 'active') {
        fetchJitsiJwt(userDetails.id).then((response) => {
          onConnect(response['jitsi-jwt'])
        })
      }
    }
  }, [roomId, localTrackReady, status])

  const onDisconnect = () => {
    if (window.jitsiGlobals?.activeRoom) {
      try {
        window.jitsiGlobals.activeRoom.leave().then(() => {
          if (window.jitsiGlobals.activeConnection) {
            window.jitsiGlobals.activeConnection.disconnect()
          }
          setRemoteTrackIds([])
          setLocalTrackReady(false)
          setActiveRoomId(null)
          window.jitsiGlobals.activeConnection = null
          window.jitsiGlobals.activeRoom = null
          conferenceState.exitedConference()
        })
      } catch (error) {
        setLastError(error.message)
      }
    }
  }

  const renderRemoteTracks = (trackGroups = {}) => {
    const ret = []
    const participantIds = Object.keys(trackGroups)
    //@ts-ignore
    const remoteTrackWidth = sidePanelRef.current?.offsetWidth || 0
    if (participantIds.length === 0) {
      return null
    }
    for (let participantId of participantIds) {
      ret.push(
        <div
          key={participantId}
          className={`jitsi__remote jitsi__remote--${view}`}
          style={{
            ...(remoteTrackWidth && {height: `calc(((${remoteTrackWidth}px / 2) + 5 ) / 1.77)` })
          }}
        >
          <RemoteTrack
            trackIds={trackGroups[participantId]}
            isCurrentSpeaker={false}
            view={view}
          />
        </div>
      )
    }
    return ret
  }

  if (conferenceIsDisabled) {
    if (view === 'side-panel') {
      return null
    }
    return (
      <div className="jitsi__cinema">
        <div className="jitsi__main-track jitsi__main-track--cinema" >
          {children}
        </div>
      </div>
    )
  }

  if (!devicesLoaded || lastError || !isJitsiAvailable) {
    if (lastError) {
      console.error('--------------- Jitsi error --------------- \n', lastError, '\n-------------------------------------------')
    }
    if (view !== 'cinema') {
      return (
        <div className={`jitsi__host-wrapper`}>
          <div className={`jitsi__main-track jitsi__main-track--${view} ${view === 'side-panel' && 'jitsi__side-panel'}`} >
            <NoVideoFeed
              isMuted={false}
              isLoading={!lastError && !devicesLoaded}
              size={'main'}
              tag={lastError ? 'Unable to connect video!' : 'Initializing Video Feeds...'}
            />
          </div>
        </div>
      )
    } else {
      return null
    }
  }

  const allRemoteTrackGroups = remoteTrackIds.reduce((groupedByParticipantId, rt) => {
    const acc = {...groupedByParticipantId}
    if (!acc[rt.participantId]) acc[rt.participantId] = []
    acc[rt.participantId].push(rt)
    return acc
  }, {})

  const participantIds = Object.keys(allRemoteTrackGroups)
  if (participantIds.length > 0) {
    if (!mainViewParticipantId || currentSpeakerId === myUserId) {
      if (mainViewParticipantId !== participantIds[0]) {
        setMainViewParticipantId(participantIds[0])
      }
    }
  }
  const remoteTrackGroupThumbnails = {...allRemoteTrackGroups}
  let mainSpeakerTrack
  if (mainViewParticipantId && view !== 'cinema') {
    mainSpeakerTrack = allRemoteTrackGroups[mainViewParticipantId]
    delete remoteTrackGroupThumbnails[mainViewParticipantId]
  }

  if (status !== 'host' && status !== 'active') {
    return waitingRoomMessage()
  }

  const isRegularConferenceView = view === 'side-panel' || view === 'conference'

  switch (view) {
    case 'side-panel': {
      return (
        <div className={`jitsi__${view}`} ref={sidePanelRef}>
          <div style={{ position: 'relative', height: '60px' }}>
            <div className="jitsi__attendees-heading">Attendees</div>
            <LocalTrack
              activeRoomId={activeRoomId}
              onTrackReady={() => setLocalTrackReady(true)}
              defaultMicId={defaultMicId}
              defaultVideoId={defaultVideoId}
              view={isRegularConferenceView && participantIds.length === 0 ? 'solo' : view }
              key='localTracks'
            />
          </div>
          {mainSpeakerTrack && (
            <div className={`jitsi__main-track jitsi__main-track--${view}`} >
              <RemoteTrack trackIds={mainSpeakerTrack} isCurrentSpeaker={true} />
            </div>
          )}
          <div className={`jitsi__remote-wrapper-scroll--${view}`}>
            <div className={`jitsi__remote-wrapper--${view}`}>
              {renderRemoteTracks(remoteTrackGroupThumbnails)}
            </div>
          </div>
        </div>
      )
    }
    case 'conference': {
      return (
        <div className={`jitsi__${view}`}>
          <div className={`jitsi__main-track jitsi__main-track--${view}`} >
            <LocalTrack
              activeRoomId={activeRoomId}
              onTrackReady={() => setLocalTrackReady(true)}
              defaultMicId={defaultMicId}
              defaultVideoId={defaultVideoId}
              view={isRegularConferenceView && participantIds.length === 0 ? 'solo' : view }
              key='localTracks'
            />
            {allRemoteTrackGroups[mainViewParticipantId] && (
              <RemoteTrack trackIds={allRemoteTrackGroups[mainViewParticipantId]} isCurrentSpeaker={true} />
            )}
          </div>
          <div className={`jitsi__remote-wrapper-scroll--${view}`}>
            <div className={`jitsi__remote-wrapper--${view}`}>
              {renderRemoteTracks(remoteTrackGroupThumbnails)}
            </div>
          </div>
        </div>
      )
    }
    case 'cinema': {
      return (
        <div className={`jitsi__${view}`}>
          <div className={`jitsi__main-track jitsi__main-track--${view}`} >
            <LocalTrack
              activeRoomId={activeRoomId}
              onTrackReady={() => setLocalTrackReady(true)}
              defaultMicId={defaultMicId}
              defaultVideoId={defaultVideoId}
              view={isRegularConferenceView && participantIds.length === 0 ? 'solo' : view }
              key='localTracks'
            />
            {children}
          </div>
          <div className={`jitsi__remote-wrapper-scroll--${view}`}>
            <div className={`jitsi__remote-wrapper--${view}`}>
              {renderRemoteTracks(remoteTrackGroupThumbnails)}
            </div>
          </div>
        </div>
      )
    }
  }
}

export default JitsiConference