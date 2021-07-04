// React
import React from 'react'
import pluralize from 'pluralize'
import styled, {css} from 'styled-components'

import allClientVariables from './variables'

import { hasPermission, isAdmin } from 'javascript/services/user-permissions'
import breakpoint from 'javascript/utils/theme/breakpoint'
import compose from 'javascript/utils/compose'
import withAdminToolbarState, { WithAdminToolbarStateType } from 'javascript/components/hoc/with-admin-toolbar-state'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'

import Icon from 'javascript/components/icon'
import Checkbox from 'javascript/components/custom-checkbox'
import StylePrefixProvider from 'javascript/utils/style-prefix/style-prefix-provider'

import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import { UserType } from 'javascript/types/ModelTypes'


interface State {}

interface Props extends WithAdminToolbarStateType {
  id: number
  type: string,
  adminToolbarCV: any
  collapsed? : boolean,
  decor?: any,
  theme: ThemeType,
  user: UserType,
}

class AdminToolbar extends React.Component<Props, State> {

  renderPages = () => {
    const decor = this.props.adminToolbarCV.theme
    const {
      id,
      type,
      theme
    } = this.props
    let pages = [{
      name: 'Admin',
      path: '/admin'
    }]
    let items = []
    if(type === 'programme'){
      pages.push(
        {
          name: `Manage ${pluralize(theme.localisation.series.upper)}`,
          path: `/admin/${theme.localisation.programme.path}/${id}/${theme.localisation.series.path}`
        },
        {
          name: `Manage Images`,
          path: `/admin/${theme.localisation.programme.path}/${id}/images`
        },
        {
          name: `Manage ${pluralize(theme.localisation.video.upper)}`,
          path: `/admin/${theme.localisation.programme.path}/${id}/${theme.localisation.video.path}`
        },
        {
          name: `Manage Content`,
          path: `/admin/${theme.localisation.programme.path}/${id}/content`
        },
        {
          name: `Detail`,
          path: `/admin/${theme.localisation.programme.path}/${id}`
        },
        {
          name: `Edit`,
          path: `/admin/${theme.localisation.programme.path}/${id}/edit`
        }
      )
    }
    if(type === 'page'){
      pages.push(
        {
          name: `Manage Content`,
          path: `/admin/pages/${id}/edit`
        },
        {
          name: `Manage Images`,
          path: `/admin/pages/page/${id}/images`
        },
      )
    }
    if(type === 'collection'){
      pages.push(
        {
          name: `Manage Content`,
          path: `/admin/pages/collection/${id}/content`
        },
        {
          name: `Manage Images`,
          path: `/admin/pages/collection/${id}/images`
        },
      )
    }
    if (type === 'news') {
      pages.push(
        {
          name: `Manage Content`,
          path: `/admin/${theme.localisation.news.path}/${id}/edit`
        },
        {
          name: `Manage Images`,
          path: `/admin/${theme.localisation.news.path}/${id}/images`
        },
      )
    }
    if (type === 'catalogue') {
      pages.push(
        {
          name: `Manage Content`,
          path: `/admin/${theme.localisation.catalogue.path}/${id}/content`
        },
        {
          name: `Manage Images`,
          path: `/admin/${theme.localisation.catalogue.path}/${id}/images`
        },
      )
    }
    pages.map((p, i) => {
      items.push(
        <ListItem key={i} decor={decor}>
          <Link href={p.path} decor={decor}>
            {p.name}
          </Link>
        </ListItem>
      )
    })
    return items
  }

  userHasPermission = () => {
    const { user, type } = this.props
    if (user) {
      if (isAdmin(user)) return true
      switch (type) {
        case 'collection':
        case 'page': {
          return hasPermission(user, 'manage_pages')
        }
        case 'programme': {
          return hasPermission(user, 'manage_programmes')
        }
        case 'news': {
          return hasPermission(user, 'manage_news')
        }
        case 'catalogue': {
          return hasPermission(user, 'manage_catalogues')
        }
      }
    }
    return false
  }


  render() {
    if (!this.userHasPermission()) {
      return null
    }

    const decor = this.props.adminToolbarCV.theme
    const collapsed = this.props.toolbarState.isToolbarHidden()
    return (
      <Toolbar decor={decor} collapsed={collapsed} data-testid="toolbar">
        <Toggle type="button"
          collapsed={collapsed}
          decor={decor}
          data-testid="toggle-button"
          onClick={this.props.toolbarState.toggleToolbar}
        >
          <ToggleIcon id={collapsed ? 'i-admin-cog' : 'i-admin-drop-arrow'} width={collapsed ? 34 : 13} height={collapsed ? 34 : 8} collapsed={collapsed} decor={decor} />
        </Toggle>

        <List decor={decor}>
          <Tools decor={decor}>
            {this.props.theme.features.contentBlocks.draftBlocks && (
              <StylePrefixProvider entryPoint={'admin'}>
                <Checkbox radio
                  key={'draft'}
                  label={'Draft'}
                  value={'draft'}
                  id={'draft'}
                  onChange={this.props.toolbarState.toggleDraftBlocks}
                  checked={this.props.toolbarState.draftBlocksAreVisible()}
                />
                <Checkbox radio
                  key={'publish'}
                  label={'Published'}
                  id={'publish'}
                  value={'publish'}
                  onChange={this.props.toolbarState.toggleDraftBlocks}
                  checked={!this.props.toolbarState.draftBlocksAreVisible()}
                />
              </StylePrefixProvider>
            )}
          </Tools>
          {this.renderPages()}
        </List>
      </Toolbar>
    )
  }
}

interface ToolbarProps {
  decor: string;
  collapsed?: boolean;
}

const Toolbar = styled.div<ToolbarProps>`
  background: ${({decor}) => decor === 'light' ? '#e8e8e8' : '#222222'}
  box-shadow: inset 0 6px 10px ${({decor}) => decor  === 'light' ? '#c5c5c5' : '#000000'}
  bottom: ${({collapsed}) => collapsed ? '-60px' : '0'}
  font-family: "Droid Sans", sans-serif;
  left: 0;
  position: fixed
  width: 100%
  z-index: 100
  transition: bottom .2s
  ${css`
    .no-scroll & {
      z-index: 30
    }
  `}
  ${breakpoint('large')`
    display: none
  `}
`

const Tools = styled.div<ToolbarProps>`
  max-height: 60px
  display: flex
  justify-content: center
  align-items: center
  border-right: 1px solid ${({decor}) => decor  === 'light' ? '#d0d0d0' : '#383838'}
  .cms-custom-checkbox {
    font-size: 12px !important;
    padding-left: 3px;
    font-weight: bold;
    color: ${({decor}) => decor  === 'light' ? '#494d52' : '#a9b1bc'}  !important;
    .cms-custom-checkbox__label::before {
      top: -3px;
    }
  }
`

const List = styled.ul<ToolbarProps>`
  border-left: 1px solid ${({decor}) => decor  === 'light' ? '#d0d0d0' : '#383838'}
  display: flex
  list-style: none
  margin: 0 0 0 25px
  padding-left: 0
`

const ListItem = styled.li<ToolbarProps>`
  border-right: 1px solid ${({decor}) => decor  === 'light' ? '#d0d0d0' : '#383838'}
`

const Link = styled.a<ToolbarProps>`
  align-items: center
  color: ${({decor}) => decor  === 'light' ? '#494d52' : '#a9b1bc'}
  display: flex
  font-size: 12px
  font-weight: bold
  height: 60px
  padding: 0 30px
  text-decoration: none
  transition: color .2s

  &:hover {
    background-color: ${({decor}) => decor  === 'light' ? '#fefefe' : '#1a1a1a'}
    box-shadow: inset 0 4px 0 #aeaeae
    color: ${({decor}) => decor  === 'light' ? '#494d52' : '#ffffff'}
  }
  `

const Toggle = styled.button<ToolbarProps>`
  background: ${({decor}) => decor === 'light' ? '#e8e8e8' : '#222222'}
  border-radius: 50%
  border: 1px solid ${({decor}) => decor  === 'light' ? '#d0d0d0' : '#383838'}
  height: 30px
  outline: none
  padding: 0
  position: absolute
  left: 10px
  width: 30px
  top: ${({collapsed}) => collapsed ? '-40px' : '-15px'}
  z-index: 20
  transition: top .2s
`
const ToggleIcon = styled(Icon)<ToolbarProps>`
  display: inline-block
  fill: ${({decor}) => decor  === 'light' ? '#494d52' : '#ffffff'}
  margin: auto
  transform: scale(${({collapsed}) => collapsed ? '0.5' : '1'});
  transform-origin: 12px 11px
  transition: fill .2s
`

const enhance = compose(
  withTheme,
  withClientVariables('adminToolbarCV', allClientVariables),
  withAdminToolbarState,
)


export default enhance(AdminToolbar)
