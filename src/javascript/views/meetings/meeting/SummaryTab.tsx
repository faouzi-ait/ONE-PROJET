import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import {
  MeetingType,
  MeetingFollowupType,
  ListType,
  ListVideoType,
  ListProgrammeType,
  ListSeryType,
  UserType
} from 'javascript/types/ModelTypes'
import { findOneByModel, createOneByModel } from 'javascript/utils/apiMethods'
import Card from 'javascript/components/card'
import { Grid, GridItem } from 'javascript/components/grid'
import Checkbox from 'javascript/components/custom-checkbox'
import LazyLoadImage from 'javascript/components/lazy-load-image'
// @ts-ignore
import ProgrammePlaceholder from 'images/theme/programme-placeholder.jpg'
import moment from 'moment'
import styled from 'styled-components'
import FormControl from 'javascript/components/form-control'
import useEnumApiLogic from 'javascript/utils/hooks/use-enum-api-logic'
import { isAdmin, hasPermission } from 'javascript/services/user-permissions'

interface Props {
  meeting: MeetingType
  user: UserType
}

const grantAccessEmailText = 'Grant access to restricted content to all email addresses'
const grantAccessUsersText = 'Grant access to restricted content to all attendees'

const SummaryTab: React.FC<Props> = ({ meeting: passedDownMeeting, user }) => {
  const {
    data: meeting,
    revalidate: revalidateMeetingFollowups,
    isValidating: isRevalidatingMeetingFollowups,
  } = useSWR<MeetingType>(
    () => `meeting-followups?meeting-id=${passedDownMeeting.id}`,
    () =>
      findOneByModel('meetings', passedDownMeeting.id, {
        fields: ['meeting-followups'],
        include: ['meeting-followups'],
        includeFields: {
          'meeting-followups': ['email', 'message', 'sent-at', 'send-to-owner', 'authorize-email', 'authorize-attendees', 'send-to-attendees'],
        },
        page: {
          size: 5,
        },
      }),
    { suspense: true },
  )

  const { data: list } = useSWR<ListType>(
    () => `list?id=${passedDownMeeting.list.id}`,
    () =>
      findOneByModel('lists', passedDownMeeting.list.id, {
        fields: ['list-programmes', 'list-series', 'list-videos'],
        include: [
          'list-programmes',
          'list-programmes.programme',
          'list-series',
          'list-series.series',
          'list-series.series.programme',
          'list-videos',
          'list-videos.video',
        ],
        includeFields: {
          'list-programmes': ['screener', 'list-position', 'programme'],
          'list-videos': [
            'screener',
            'list-position',
            'video',
            'programme-name',
          ],
          'list-series': [
            'screener',
            'list-position',
            'series',
            'programme-name',
          ],
          series: ['programme', 'name'],
          programmes: ['title', 'thumbnail'],
          videos: ['name', 'poster'],
        },
      } as any),
    {
      suspense: true,
    },
  )

  const [meetingFollowupToResend, setMeetingFollowupToResend] = useState<
    MeetingFollowupType
  >()

  const screeners = [
    ...list['list-programmes'],
    ...list['list-series'],
    ...list['list-videos'],
  ]
    .filter(elem => elem.screener)
    .sort((a, b) => (a['list-position'] > b['list-position'] ? 1 : -1))

  const meetingFollowups: MeetingFollowupType[] =
    (meeting || {
      'meeting-followups': [],
    })['meeting-followups'] || []

  return (
    <CustomCSS className="meeting-summary">
      <Grid internalMargin="20px">
        {screeners.length > 0 && (
          <GridItem>
            <ScreenersArea screeners={screeners} />
          </GridItem>
        )}
        <GridItem>
          <Grid internalMargin="10px">
            <GridItem removeChildMargin>
              <h2>Meeting Follow-up Emails</h2>
            </GridItem>
            {meetingFollowups.map((followup, index) => {
              return (
                <GridItem key={followup.id} xs={12}>
                  <Grid
                    internalMargin="5px"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <GridItem xs={9}>
                      <Grid internalMargin="5px">
                        <GridItem>
                          <Grid internalMargin="0px">
                            <GridItem removeChildMargin>
                              <h4>{`To: ${followup.email || ''}${followup.email && followup['send-to-attendees'] && ' & ' || ''}
                              ${followup['send-to-attendees'] && 'all attendees' || ''}`}</h4>
                            </GridItem>
                            <GridItem removeChildMargin>
                              <SentAtText>
                                {moment(followup['sent-at']).isValid()
                                  ? `Sent at: ${moment(
                                      followup['sent-at'],
                                    ).format('LLLL')}`
                                  : 'Not Sent Yet'}
                              </SentAtText>
                            </GridItem>
                          </Grid>
                        </GridItem>
                        <GridItem removeChildMargin>
                          <p>{followup.message || 'No message sent'}</p>
                        </GridItem>
                        <Grid internalMargin="0px">
                          <SentAtText>
                            {grantAccessEmailText}: {followup['authorize-email'] ? 'Yes': 'No'} <br/ >
                            {grantAccessUsersText}: {followup['authorize-attendees'] ? 'Yes': 'No'}
                          </SentAtText>
                        </Grid>
                      </Grid>
                    </GridItem>
                    <GridItem xs={3}>
                      <div
                        style={{ display: 'flex', justifyContent: 'flex-end' }}
                      >
                        <button
                          className="button"
                          type="button"
                          onClick={() => {
                            setMeetingFollowupToResend(followup)
                          }}
                        >
                          Resend Email
                        </button>
                      </div>
                    </GridItem>
                  </Grid>
                  <Divider />
                </GridItem>
              )
            })}
            <GridItem>
              <ResendEmailForm
                hasScreeners={screeners.length > 0}
                meeting={passedDownMeeting}
                revalidate={() => {
                  revalidateMeetingFollowups()
                  setMeetingFollowupToResend(undefined)
                }}
                isRevalidating={isRevalidatingMeetingFollowups}
                meetingFollowupToResend={meetingFollowupToResend}
                user={user}
              />
            </GridItem>
          </Grid>
        </GridItem>
      </Grid>
    </CustomCSS>
  )
}

export const ScreenersArea: React.FC<{
  screeners: (ListVideoType | ListProgrammeType | ListSeryType)[]
}> = ({ screeners }) => {
  return (
    <Grid internalMargin="15px" alignItems="stretch">
      <GridItem removeChildMargin>
        <h2>Screeners Selected</h2>
      </GridItem>
      {screeners.map(resource => {
        if (resource.type === 'list-programmes') {
          return (
            <GridItem xs={4} xl={3}>
              <LazyLoadImage
                src={resource.programme.thumbnail.small.url}
                placeholderSrc={ProgrammePlaceholder}
              >
                {src => (
                  <Card
                    withScreenerIcon
                    image={{ src }}
                    title={resource.programme.title}
                  ></Card>
                )}
              </LazyLoadImage>
            </GridItem>
          )
        }
        if (resource.type === 'list-series') {
          return (
            <GridItem xs={4} xl={3}>
              <LazyLoadImage
                src={resource.series.programme.thumbnail.small.url}
                placeholderSrc={ProgrammePlaceholder}
              >
                {src => (
                  <Card
                    withScreenerIcon
                    image={{ src }}
                    title={[
                      resource.series.name,
                      resource['programme-name'],
                    ].join(' - ')}
                  ></Card>
                )}
              </LazyLoadImage>
            </GridItem>
          )
        }
        if (resource.type === 'list-videos') {
          return (
            <GridItem xs={4} xl={3}>
              <LazyLoadImage
                src={resource.video.poster.small.url}
                placeholderSrc={ProgrammePlaceholder}
              >
                {src => (
                  <Card
                    withScreenerIcon
                    image={{ src }}
                    title={[
                      resource.video.name,
                      resource['programme-name'],
                    ].join(' - ')}
                  ></Card>
                )}
              </LazyLoadImage>
            </GridItem>
          )
        }
      })}
    </Grid>
  )
}

const isValidEmail = (text: string) => /@/.test(text) && /\./.test(text)

export const CustomCSS = styled.div`
  .card {
    width: 100%;
  }
`

const SentAtText = styled.p`
  color: #a9b1bc;
  font-size: 13px;
`

const ResendEmailForm: React.FC<{
  meetingFollowupToResend: Partial<MeetingFollowupType>
  revalidate: () => void
  isRevalidating: boolean
  meeting: MeetingType
  hasScreeners?: boolean
  user: UserType
}> = ({
  meetingFollowupToResend = {},
  revalidate,
  isRevalidating,
  meeting,
  hasScreeners,
  user
}) => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sendToOwner, setSendToOwner] = useState(true)
  const [grantAccessEmails, setGrantAccessEmails] = useState(false)
  const [grantAccessUsers, setGrantAccessUsers] = useState(false)

  useEffect(() => {
    if (meetingFollowupToResend.id) {
      setEmail(meetingFollowupToResend.email)
      setMessage(meetingFollowupToResend.message)
      setSendToOwner(meetingFollowupToResend['send-to-owner'])
      setGrantAccessEmails(meetingFollowupToResend['authorize-email'])
      setGrantAccessUsers(meetingFollowupToResend['authorize-attendees'])
    } else {
      setEmail('')
      setSendToOwner(true)
      setMessage('')
      setGrantAccessEmails(false)
      setGrantAccessUsers(false)
    }
  }, [meetingFollowupToResend.id])

  const {
    state: { status },
    reportError,
    reportFulfilled,
    reportStarted,
  } = useEnumApiLogic()

  const isValid = Boolean(
    ((email && isValidEmail(email)) || sendToOwner) &&
      (message || hasScreeners),
  )

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isValid) {
      reportStarted()
      createOneByModel('meeting-followup', {
        email,
        message,
        meeting,
        'send-to-owner': sendToOwner,
        'authorize-email': grantAccessEmails,
        'authorize-attendees': grantAccessUsers,
        list: {
          id: meeting.list.id,
        },
      })
        .then(() => {
          reportFulfilled()
          revalidate()
        })
        .catch(reportError)
    }
  }

  const noEmailHasBeenSent = !meetingFollowupToResend.id

  const canGrantAccess = () => {
    return (isAdmin(user) ||
    hasPermission(user, ['extend_permissions']) ||
    hasPermission(user, ['manage_programmes']) ||
    hasPermission(user, ['manage_video_permissions']))
  }

  return (
    <form onSubmit={onSubmit}>
      <Grid internalMargin="10px">
        <GridItem removeChildMargin>
          <h3>{noEmailHasBeenSent ? 'Send' : 'Resend'} Follow-up Email</h3>
        </GridItem>
        <GridItem xs={6} removeChildMargin>
          <FormControl
            onChange={e => setEmail(e.target.value)}
            type="text"
            label="Email"
            value={email}
          ></FormControl>
        </GridItem>
        <GridItem removeChildMargin>
          <FormControl
            onChange={e => setMessage(e.target.value)}
            type="textarea"
            label="Message"
            value={message}
          />
        </GridItem>
        <GridItem>
          <Checkbox
            label="Send to Myself?"
            id="sentToOwnerCheckbox"
            name="sentToOwnerCheckbox"
            onChange={() => setSendToOwner(!sendToOwner)}
            checked={sendToOwner} />
        </GridItem>
        {canGrantAccess() && hasScreeners && email.length > 0 &&
          <GridItem>
            <Checkbox
              label={grantAccessEmailText}
              id="grantAccessEmailsCheckbox"
              name="grantAccessEmailCheckbox"
              onChange={() => setGrantAccessEmails(!grantAccessEmails)}
              checked={grantAccessEmails} />
          </GridItem>
        }
        <GridItem>
          <button
            className={[
              'button',
              'button--filled',
              ((isRevalidating && status === 'fulfilled') ||
                status === 'loading') &&
                'button--loading',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={!isValid}
          >
            Send
          </button>
        </GridItem>
      </Grid>
    </form>
  )
}

const Divider = styled.hr`
  opacity: 0.2;
  margin: 0px;
  margin-top: 20px;
`

export default SummaryTab
