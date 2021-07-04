import React, { Suspense, useState } from 'react'
import Meta from 'react-document-meta'
import styled from 'styled-components'

import Button from 'javascript/components/button'
import PageHeader from 'javascript/components/admin/layout/page-header'
import { Alert } from 'javascript/components/admin/alert'
import { ModalAsComponent } from 'javascript/components/modal/ModalAsComponent'

// @ts-ignore
import brightcoveLogo from './brightcove.png'
// @ts-ignore
import knoxLogo from './knox.jpg'
// @ts-ignore
import wistiaLogo from './wistia.png'
import { useGetBrightcove, useGetWistia, useGetKnox } from './hooks'
import { BrightcoveForm } from './BrightcoveForm'
import { WistiaForm } from './WistiaForm'
import { KnoxForm } from './KnoxForm'

/*********************** MAIN **************************/

const AdminConfigProvidersInner = () => {
  const brightcove = useGetBrightcove()
  const wistia = useGetWistia()
  const knox = useGetKnox()

  const [whichModalIsOpen, setWhichModalIsOpen] = useState<ModalOpen>(undefined)

  return (
    <div>
      {!brightcove.data && !wistia.data && !knox.data && (
        <Alert text="You currently have no video providers configured."></Alert>
      )}
      <ProviderBox
        title={'Brightcove'}
        onOpen={() => setWhichModalIsOpen('brightcove')}
        buttonText={`${brightcove.data ? 'Update' : 'Add'} Brightcove`}
        enabled={Boolean(brightcove.data)}
      ></ProviderBox>
      <ProviderBox
        title={'Wistia'}
        onOpen={() => setWhichModalIsOpen('wistia')}
        buttonText={`${wistia.data ? 'Update' : 'Add'} Wistia`}
        enabled={Boolean(wistia.data)}
      ></ProviderBox>
      <ProviderBox
        title={'Knox'}
        onOpen={() => setWhichModalIsOpen('knox')}
        buttonText={`${knox.data ? 'Update' : 'Add'} Knox`}
        enabled={Boolean(knox.data)}
      ></ProviderBox>
      <ModalAsComponent
        isOpen={whichModalIsOpen === 'brightcove'}
        closeEvent={() => setWhichModalIsOpen(undefined)}
      >
        <div className="cms-modal__content">
          <BrightcoveForm closeEvent={() => setWhichModalIsOpen(undefined)} />
        </div>
      </ModalAsComponent>
      <ModalAsComponent
        isOpen={whichModalIsOpen === 'wistia'}
        closeEvent={() => setWhichModalIsOpen(undefined)}
      >
        <div className="cms-modal__content">
          <WistiaForm closeEvent={() => setWhichModalIsOpen(undefined)} />
        </div>
      </ModalAsComponent>
      <ModalAsComponent
        isOpen={whichModalIsOpen === 'knox'}
        closeEvent={() => setWhichModalIsOpen(undefined)}
      >
        <div className="cms-modal__content">
          <KnoxForm closeEvent={() => setWhichModalIsOpen(undefined)} />
        </div>
      </ModalAsComponent>
    </div>
  )
}

const AdminConfigProvidersOuter = props => {
  return (
    <Meta>
      <main>
        <PageHeader title="Video Providers" />
        <div className="container">
          <Suspense fallback={<div className="loader"></div>}>
            <AdminConfigProvidersInner {...props} />
          </Suspense>
        </div>
      </main>
    </Meta>
  )
}

export default AdminConfigProvidersOuter

type ModalOpen = 'brightcove' | 'wistia' | 'knox' | undefined

/*********************** PROVIDER BOX **************************/

const logoMap = {
  brightcove: brightcoveLogo,
  knox: knoxLogo,
  wistia: wistiaLogo,
}

const ProviderBox = ({ title = '', onOpen, buttonText, enabled = false }) => {
  return (
    <div>
      <ProviderWrapper>
        <div style={{ flexGrow: 1 }}>
          <TitleWrapper>
            <h3>{title}</h3>
            {enabled && <Pill>Enabled</Pill>}
          </TitleWrapper>
          <Button className="button button--small" onClick={onOpen}>
            {buttonText}
          </Button>
        </div>
        {logoMap[title.toLowerCase()] && (
          <ProviderLogo
            src={logoMap[title.toLowerCase()]}
            alt={`${title} logo`}
          ></ProviderLogo>
        )}
      </ProviderWrapper>
    </div>
  )
}

const Pill = styled.div`
  padding: 0.25rem 0.4rem;
  font-size: 0.8rem;
  color: white;
  background-color: #26cd6f;
  border-radius: 5px;
  margin-left: 1rem;
`

const TitleWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`

const ProviderWrapper = styled.div`
  padding: 1.5rem;
  background-color: white;
  position: relative;
  margin-top: 2.5rem;
  display: inline-flex;
  align-items: center;

  min-width: 600px;
  h3 {
    margin: 0px;
  }
`

const ProviderLogo = styled.img`
  width: 8rem;
  margin-right: 1.5rem;
`
