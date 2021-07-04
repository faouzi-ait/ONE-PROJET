import React from 'react'
import pluralize from 'pluralize'
import { NavLink } from 'react-router-dom'

// Stores
import FoldersStore from 'javascript/stores/folders'

// Actions
import ListsActions from 'javascript/actions/lists'

// Components
import Banner from 'javascript/components/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import AccountNavigation from 'javascript/components/account-navigation'
import Card from 'javascript/components/card'
import Icon from 'javascript/components/icon'
import Meta from 'react-document-meta'
import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'

import allClientVariables from './variables'
import listsVariablesClientVariables from 'javascript/views/lists/lists.variables'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import ClientProps from 'javascript/utils/client-switch/components/client-props'

class ListsIndex extends PageHelper {
  constructor(props) {
    super(props)
    this.state = {
      user: this.props.user,
      folders: false
    }
  }

  componentWillMount() {
    this.setState({
      folders: FoldersStore.getResources(this.props.theme)
    })
    FoldersStore.on('change', this.getResources)
  }

  componentWillUnmount() {
    FoldersStore.removeListener('change', this.getResources)
  }

  componentDidMount() {
    this.state.folders.map(folder => {
      const options = {
        'filter[global]': folder.global,
        'filter[meeting_list]': false,
        'fields': {
          'lists': 'images',
        }
      }
      if (!folder.global) {
        options['filter[user_id]'] = this.state.user.id
      }
      if(folder.global && !this.state.user['user-type'] === 'internal'){
        options['filter[internal]'] = false
      }
      ListsActions.getFolder(folder, options)
    })
  }

  getResources = () => {
    this.setState({
      folders: FoldersStore.getResources(this.props.theme)
    })

    if (this.state.folders) {
      this.finishedLoading()
    }
  }

  render() {
    const { theme } = this.props
    const {
      sectionClasses,
      containerClasses,
      introClasses,
      introText,
      gridClasses
    } = this.props.indexVariablesCV
    const {
      bannerClasses,
    } = this.props.listsVariablesCV
    return (
      <Meta
        title={`${theme.localisation.client} :: ${pluralize(theme.localisation.list.upper)}`}
        meta={{
          description: `Organise your ${pluralize(theme.localisation.list.upper)}`
        }}>
        <PageLoader {...this.state}>
          <main>
            <div className="fade-on-load">
              <LoadPageBannerImage slug={theme.variables.SystemPages.list.path} fallbackBannerImage={this.props.listsVariablesCV.bannerImage}>
                {({ image }) => (
                  <Banner title={theme.variables.SystemPages.list.upper}
                    classes={bannerClasses}
                    image={image}
                  />
                )}
              </LoadPageBannerImage>
              <Breadcrumbs paths={[
                { name: theme.variables.SystemPages.account.upper, url: `/${theme.variables.SystemPages.account.path}` },
                { name: theme.variables.SystemPages.list.upper, url: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}` }
              ]} />

              <AccountNavigation currentPage={`/${theme.variables.SystemPages.list.path}`} />

              <section className={sectionClasses}>
                <div className={containerClasses}>
                  <p className={introClasses}>{introText(pluralize(theme.localisation.list.lower))}</p>
                  <div className={gridClasses}>
                      {this.state.folders.map((folder, index) => {

                        let images = []
                        folder.lists.forEach(list => {
                          list.images.forEach(lp => {
                            if (images.length < 4) {
                              images.push(lp)
                            }
                          })
                        })
                        return <ClientProps
                        clientProps={{
                          images: {
                            default: images.length >= 4 ? images : [images[0]]
                          },
                          classes: {
                            default: [],
                            'ae': ['wide', 'list'],
                            'all3 | banijaygroup | cineflix': ['list']
                          },
                          title: {
                            default: folder.localizedName,
                            'amc': null
                          }
                        }}
                        renderProp={(clientProps) => {
                        return (
                          <Card
                            key={folder.id}
                            cardId={folder.id}
                            url={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}/${folder.localizedId}`}
                            {...clientProps}
                          >
                            <ClientChoice>
                              <ClientSpecific client="default">
                                <div>
                                  <span className="card__count">
                                    {theme.variables.ListFolderIcon ?
                                      <>
                                        <Icon id="i-folder" />
                                        <span>
                                        { folder.lists.length }
                                        </span>
                                      </>
                                    : folder.lists.length }
                                  </span>
                                  <span className="card__copy">{pluralize(theme.localisation.list.upper)}</span>
                                </div>
                              </ClientSpecific>
                              <ClientSpecific client="ae">
                                <span className="card__count">
                                  <Icon id="i-folderLarge" width="58" height="59" viewBox="0 0 58 59" />
                                  <span>{ folder.lists.length }</span>
                                </span>
                              </ClientSpecific>
                              <ClientSpecific client="amc">
                                <div className="card__actions"></div>
                                <div class="card__title-wrap">
                                  <span className="card__list-count">{folder.lists.length} { pluralize(theme.localisation.list.upper) }</span><br/>
                                  <h3 class="card__title">
                                    <NavLink draggable="false" to={ `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}/${folder.localizedId}` }>{folder.localizedName}</NavLink>
                                  </h3>
                                </div>
                              </ClientSpecific>
                            </ClientChoice>
                          </Card>
                        )
                        }}/>
                      })}
                    </div>
                  </div>
              </section>
            </div>
          </main>
        </PageLoader>
      </Meta>
        )
      }
}

const enhance = compose(
  withClientVariables('indexVariablesCV', allClientVariables),
  withClientVariables('listsVariablesCV', listsVariablesClientVariables)
)

export default enhance(ListsIndex)