import React from 'react'
import { ScreenersArea, CustomCSS } from './SummaryTab'
import { storiesOf } from '@storybook/react'

storiesOf('SummaryTab', module).add('Screeners Area', () => (
  <div className="modal modal--meeting">
    <div className="modal__wrapper">
      <div className="modal__content">
        <div className="meeting-summary">
          <CustomCSS>
            <ScreenersArea
              screeners={
                [
                  {
                    type: 'list-programmes',
                    programme: {
                      title: 'Title number one!',
                      thumbnail: {
                        small: {
                          url:
                            'https://cdn.pixabay.com/photo/2016/11/29/04/19/beach-1867285_960_720.jpg',
                        },
                      },
                    },
                  },
                  {
                    type: 'list-programmes',
                    programme: {
                      title: 'Title number two!',
                      thumbnail: {
                        small: {
                          url:
                            'https://cdn.pixabay.com/photo/2016/11/29/04/19/beach-1867285_960_720.jpg',
                        },
                      },
                    },
                  },
                  {
                    type: 'list-programmes',
                    programme: {
                      title: 'Title number three - testing no URL',
                      thumbnail: {
                        small: {
                          url: '',
                        },
                      },
                    },
                  },
                  {
                    type: 'list-programmes',
                    programme: {
                      title: 'Title number four!',
                      thumbnail: {
                        small: {
                          url:
                            'https://cdn.pixabay.com/photo/2016/11/29/04/19/beach-1867285_960_720.jpg',
                        },
                      },
                    },
                  },
                  {
                    type: 'list-videos',
                    'programme-name': 'A programme name!',
                    video: {
                      name: 'Video number one!',
                      poster: {
                        small: {
                          url:
                            'https://cdn.pixabay.com/photo/2016/11/29/04/19/beach-1867285_960_720.jpg',
                        },
                      },
                    },
                  },
                ] as any[]
              }
            />
          </CustomCSS>
        </div>
      </div>
    </div>
  </div>
))
