import React from 'react'
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { Controller, Scene } from 'react-scrollmagic';
import { Tween, Timeline } from 'react-gsap';

import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'

const StickyWrapper = styled.div`
  overflow: hidden;
  .fixed-image, 
  .moving-image {
    height: 100%;
    object-fit: cover;
    opacity: .9;
    width: 100%
  }
  .moving-image {
    left: 0;
    position: absolute;
  }
  .sticky-section {
    height: calc(100vh - 100px);
    background: #${props => props.theme.variables.ChartBgColor}
    width: 100%;
  }
  @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
    .sticky-section,
    .fixed-image, 
    .moving-image {
      height: auto;
    }
    .moving-image {
      position: static
    }
  }
  @media screen and (max-width: 638px) {
    .sticky-section {
      height: calc(100vh - 80px);
    }
  }
`;

const ContentWrapper = styled.div`
  position: absolute;
  text-align: center;
  top: 50%;
  height: 100%;
  width: 100%;
  z-index: 3;
`

const Content = styled.div`
  transform: translateY(-50%);
  padding: 20px;
`

const Title = styled.h2`
  color: white;
  margin: 0 0 20px;
  font-size: 82px;
  font-weight: bold;
  @media (max-width: 768px) {
    font-size: 42px;
  }
`
const Intro = styled.p`
  color: white;
  font-size: 22px;
  margin: 0 auto 30px;
  max-width: 630px;
`
const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-right: -10px;
  margin-bottom: -10px;
  > * {
    margin-right: 10px;
    margin-bottom: 10px;
  }
`

const Shadow = styled.div`
  background: #${props => props.theme.variables.ChartBgColor}
  opacity: 0;
  height: 100%;
  width: 100%;
  position: absolute;
  top:0;
  left: 0;
`

const BannerScrollerBlock = ({block, assets, theme}) => {
  return (
    <StickyWrapper>
      {block?.tabs.map((tab, i) => {
        const desktopImage = assets['page-images'].filter(d => d.id === tab.desktopImage?.id)
        const mobileImage = assets['page-images'].filter(d => d.id === tab.mobileImage?.id)
        return (
          <Controller>
            <Scene
              triggerHook="onLeave"
              offset={window.innerWidth <= 638 ? -80 : -100}
              duration={2000}
              pin
            >
              {(progress) => (
                <div className="sticky-section">
                  {i === 0 ? 
                  (<picture>
                      <source srcSet={mobileImage[0]?.file?.url.replace('.net/', '.net/1536xnull/')} media={`(max-width: 768px)`} />
                      <img srcSet={desktopImage[0]?.file?.url} className={'fixed-image'} />
                    </picture>
                  ) : (
                    <Tween
                      from={{ top: '100vh' }}
                      to={{ top: '0' }}>
                      <picture>
                        <source srcSet={mobileImage[0]?.file?.url.replace('.net/', '.net/1536xnull/')} media={`(max-width: 768px)`} />
                        <img srcSet={desktopImage[0]?.file?.url} className={'moving-image'} />
                      </picture>
                    </Tween>
                  )}
                  <Timeline totalProgress={progress} paused>
                    <Tween
                        from={{ top: '120vh' }}
                        to={{ top: '50vh' }}>
                      <ContentWrapper>
                        <Content>
                          <Title>{tab.title}</Title>
                          <Intro>{tab.intro}</Intro>
                          <Buttons>
                            {tab.button1Link && tab.button1Text &&
                              <NavLink to={tab.button1Link} className="button button--filled">
                                {tab.button1Text}
                              </NavLink>
                            }
                            {tab.button2Link && tab.button2Text &&
                              <NavLink to={tab.button2Link} className="button button--filled">
                                {tab.button2Text}
                              </NavLink>
                            }
                          </Buttons>
                        </Content>
                      </ContentWrapper>
                    </Tween>
                    <Tween
                        from={{ opacity: 0 }}
                        to={{ opacity: 0.8 }}
                        position={-0.1}>
                        <Shadow theme={theme} />
                    </Tween>
                  </Timeline>
                  </div>
              )}
            </Scene>
          </Controller>
        )
      })}
  </StickyWrapper>
  )
}

const enhance = compose(
  withTheme
)
const EnhancedBannerScroller = enhance(BannerScrollerBlock)

export default (block, assets, props) => {
  return (
    <EnhancedBannerScroller {...props} block={block} assets={assets} />
  )
}