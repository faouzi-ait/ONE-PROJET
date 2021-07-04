import React, { useEffect } from 'react'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import { useTopGenreScores } from 'javascript/components/recommended-programmes'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'

// Components
import AccountManager from 'javascript/components/account-manager'
import Banner from 'javascript/components/banner'
import ContinueWatching from 'javascript/components/continue-watching'
import DashboardBanner from 'javascript/views/dashboard/banner'
import DashboardList from 'javascript/views/dashboard/lists'
import DashboardProgrammes from 'javascript/views/dashboard/programmes'
import Greeting from 'javascript/views/dashboard/greeting'
import ListModal from 'javascript/components/list-modal'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import RecommendedGenres from 'javascript/components/recommended-genres'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'

// Types
import { GenreScoreType, UserType } from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

interface Props extends WithPageHelperType {
  theme: ThemeType
  topGenreScore: GenreScoreType
  topGenreScores: GenreScoreType[]
  user: UserType
}

const DashboardIndex: React.FC<Props> = ({
  pageIsLoading,
  theme,
  modalState,
  topGenreScore,
  topGenreScores,
  user,
}) => {

  useEffect(() => {
    if (topGenreScore) {
      pageIsLoading(false)
    }
  }, [topGenreScore])


  const addToList = (resources) => () => {
    modalState.showModal(({ hideModal }) => (
      <Modal delay={500} customContent={true} modifiers={['custom-content']} closeEvent={hideModal}>
        <ListModal resourcesToAddToList={resources} closeEvent={hideModal} user={user} />
      </Modal>
    ))
  }

  let bannerImage
  if (topGenreScore?.genre && topGenreScore.genre['featured-programme'] && !topGenreScore.genre['featured-programme'].restricted) {
    bannerImage = topGenreScore.genre['featured-programme']?.['banner-urls']
  }
  return (
    <Meta
      title={`${theme.localisation.client} :: ${theme.variables.SystemPages.dashboard.upper}`}
      meta={{
        description: "Buyers Dashboard"
      }}>
      <main>
        <div className="fade-on-load">
          <LoadPageBannerImage
            slug={theme.variables.SystemPages.dashboard.path}
            fallbackBannerImage={bannerImage}
          >
            {({ image }) => (
              <Banner
                classes={['gradient', 'catalogue-show']}
                image={image}
              >
                <DashboardBanner genre={topGenreScore?.genre || {}} />
              </Banner>
            )}
          </LoadPageBannerImage>
        </div>
        <Greeting name={user['first-name']}/>
        <DashboardProgrammes topGenreScore={topGenreScore} addToList={addToList} />
        <section className="section section--shade">
          <div className="container">
            <ContinueWatching />
          </div>
        </section>
        <DashboardList  />
        <section className="section">
          <div className="container">
            <RecommendedGenres
              title={`Recommended ${pluralize(theme.localisation.genre.upper)}`}
              topGenres={(topGenreScores || []).map((genreScore) => genreScore.genre)}
            />
          </div>
        </section>
        <section className="section section--shade">
          <div className="container">
            <AccountManager />
          </div>
        </section>
      </main>
    </Meta>
  )
}

const enhance = compose(
  withPageHelper,
  withHooks(useTopGenreScores)
)
export default enhance(DashboardIndex)