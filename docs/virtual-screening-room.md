# Virtual Screening Room

## How it works
Virtual Screening Room is a feature of meetings that allows hosts to share videos with a number of attendees. The feature is detailed out here https://support.thisisone.tv/en/articles/4323027-virtual-screening-room

## Web sockets
The feature uses websockets via the api to share messages between host and attendees. New web socket messages need to be added in the api first before they can be used. The current ones are listed out on https://github.com/thisisonetv/one-web/blob/master/src/javascript/views/virtual-screening/socket-actions.ts

## Video conferencing
An optional feature of Virtual Screening Room is video conferencing which can be enabled/disabled when setting up the meeting. Video conferencing uses jitsi server which is handled on the backend. 

Attendees have to give browser access to their camera and microphone which they will prompted to do on first load of the meeting.

For running video conferencing in development you will need to set 'https' on your local server to true. This can be done on https://github.com/thisisonetv/one-web/blob/master/webpack/development.config.js#L49 

## Users
Attendees can either be registered users or guest users. On creation of a meeting, a unique meeting url will be created that has a virtual meeeting token param. 

## Gotchas
### Autoplay 
When attendees view a video that is being shared we utilise autoplay. Many browsers block this by default most notably safari. We display extra messaging for safari users to show them how to change their browwser settings. 
https://github.com/thisisonetv/one-web/blob/master/src/javascript/views/virtual-screening/client/index.tsx#L604

### Continue button
If an attendee has multiple windows open and the window with virtual screening is not focused then when a video is screened they will be stuck on the 'synchronising live event' message. We have got round this by introducing a 'continue' button if they have been on this display for more than 20 seconds to ensure they refocus the window.

### Cant access state in websocket messages
When the client recieves a websocket message, we loop through the different types to perform relevant functions. Within this loop we can't access state so instead we create a variable in state that we update and then can add a listener to.

https://github.com/thisisonetv/one-web/blob/master/src/javascript/views/virtual-screening/client/index.tsx#L105

### Attendee Waiting
If a user's attendee drops out we need to make sure they are not immediately replaced in the meeting by another waiting attendee. Therefore we wait for 20seconds before allowing an attendee in to the meeting and they will see a 'waiting' message. After this time they will either either be let in to the meeting or see a 'meeting has reached capaity' message if the meeting has reached the limit set in `features.virtualMeetings.maxAttendees`
