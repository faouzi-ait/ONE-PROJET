import React from 'react'
import uuid from 'uuid/v4'
import pluralize from 'pluralize'

import PageHelper from 'javascript/views/page-helper'
import withTheme from 'javascript/utils/theme/withTheme'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withPrefix from 'javascript/components/hoc/with-prefix'
import ClientProps from 'javascript/utils/client-switch/components/client-props'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import programmeQuery from 'javascript/utils/queries/programmes'

// Actions
import ProgrammeActions from 'javascript/actions/programmes'

// Stores
import ProgrammeStore from 'javascript/stores/programmes'

// Components
import Card from 'javascript/components/card'
import Icon from 'javascript/components/icon'
import IconCard from 'javascript/components/icon-card'
import RemoveButton from 'javascript/components/remove-button'
import Modal from 'javascript/components/modal'
import ProgrammesForm from 'javascript/components/related-programmes/form'
import relatedProgrammesClientVariables from './variables'
import catalogueCardsClientVariables from 'javascript/views/catalogue/variables'
import ProgrammeCard from 'javascript/components/programme-card'


// Render
class RelatedProgrammes extends PageHelper {
  constructor(props) {
    super(props)
    const { programme } = props
    this.state = {
      defaultRelatedProgrammes: [],
      selectedProgrammes: programme['related-programmes'] || []
    }
  }

  componentWillMount() {
    ProgrammeStore.on('dataChange', this.setProgrammesToState)
  }

  componentWillUnmount() {
    ProgrammeStore.removeListener('dataChange', this.setProgrammesToState)
  }

  componentDidMount() {
    this.getExtraProgrammes()
  }

  getLeftOverSlots = () => {
    const { selectedProgrammes } = this.state
    const { showEditOptions } = this.props
    return Math.max(
      this.props.theme.features.relatedProgrammes.toShow - selectedProgrammes.length,
      0
    )
  }

  getExtraProgrammes = () => {
    const { selectedProgrammes } = this.state
    const { programme, theme, catalogueCardsCV } = this.props
    const leftOverSlots = this.getLeftOverSlots()
    const selectedIds = selectedProgrammes.map(a => a.id).join(',')
    const defaultQuery = programmeQuery(theme, catalogueCardsCV)
    
    if (leftOverSlots > 0) {
      ProgrammeActions.getDataResources({
        ...defaultQuery,
        filter: {
          'default-related-programmes': programme.id,
          'not_ids': selectedIds.length ? selectedIds : programme.id
        },
        page: {
          size: leftOverSlots
        },
      })
    }
  }

  setProgrammesToState = () => {
    this.setState({
      defaultRelatedProgrammes: ProgrammeStore.getDataResources()
    })
  }

  addProgramme = (newProgramme) => {
    const { onChange } = this.props
    const { selectedProgrammes } = this.state
    const update = [
      newProgramme,
      ...selectedProgrammes
    ]
    this.setState({
      selectedProgrammes: update
    }, () => {
      onChange(update)
      this.getExtraProgrammes()
      this.unsetModal()
    })
  }

  removeProgramme = (programme) => {
    const { onChange } = this.props
    const { selectedProgrammes } = this.state
    const update = selectedProgrammes.filter(selectedProgramme => {
      return selectedProgramme.id !== programme.id
    })
    this.setState({
      selectedProgrammes: update
    }, () => {
      onChange(update)
      this.getExtraProgrammes()
    })
  }

  openProgrammeForm = () => {
    const { prefix, programme, theme } = this.props
    const { selectedProgrammes } = this.state
    this.setState({
      modal: () => (
        <Modal closeEvent={this.unsetModal} title={`Add ${theme.localisation.programme.upper}`} ref="modal">
          <div className={`${prefix}modal__content`} style={{ minHeight: '400px' }}>
            <ProgrammesForm
              onChange={this.addProgramme}
              existingProgrammes={[
                programme,
                ...selectedProgrammes
              ]} />
          </div>
        </Modal>
      )
    })
  }

  renderCards = (programme, index, remove = false) => {
    return (
      <div className="card-group" style={this.props.showEditOptions && { opacity: remove ? 1 : 0.4 }} key={index}>
        <ProgrammeCard programme={programme} addToList={this.props.addToList}>
          {this.props.showEditOptions && remove &&
            <div className="card__actions">
              <RemoveButton onClick={() => this.removeProgramme(programme)} />
            </div>
          }
        </ProgrammeCard>
      </div>
    )
  }

  render() {
    const {
      selectedProgrammes,
      defaultRelatedProgrammes,
      modal
    } = this.state
    const { showEditOptions, theme, relatedProgrammesCV, stylePrefixEntryPoint } = this.props
    const leftOverSlots = this.getLeftOverSlots()

    if(selectedProgrammes.length < 1 && defaultRelatedProgrammes.length < 1 && !showEditOptions){
      return false
    }

    return (
      <section className={stylePrefixEntryPoint === 'admin' ? '' : relatedProgrammesCV.sectionClasses}>
        <div className={showEditOptions ? 'custom' : 'container'}>
          {!showEditOptions &&
            <h1 className="section__header">{relatedProgrammesCV.title(theme.localisation)}</h1>
          }
          <div className={`grid ${theme.features.relatedProgrammes.toShow === 3 ? 'grid--three' : 'grid--four'}`}>

            {(showEditOptions && selectedProgrammes.length < theme.features.relatedProgrammes.toShow) &&
              <div className="card-group" style={{minHeight: '225px'}}>
                <IconCard onClick={this.openProgrammeForm} Icon={() => (
                  <ClientChoice>
                    <ClientSpecific client="default">
                      <Icon width="20" height="20" id="i-add" viewBox="0 0 14 14" />
                    </ClientSpecific>
                    <ClientSpecific client="amc | cineflix | keshet">
                    <Icon width="32" height="32" id="i-add" viewBox="0 0 32 32" />
                    </ClientSpecific>
                  </ClientChoice>
                )} />
              </div>
            }

            {selectedProgrammes?.map((programme, index) => {
              return this.renderCards(programme, index, true)
            })}

            {defaultRelatedProgrammes?.slice(0, leftOverSlots).map((programme, index) => {
              return this.renderCards(programme, index)
            })}

          </div>

        </div>
        {(showEditOptions && modal) && modal()}
      </section>
    )
  }
}


const enhance = compose(
  withTheme,
  withPrefix,
  withClientVariables('relatedProgrammesCV', relatedProgrammesClientVariables),
  withClientVariables('catalogueCardsCV', catalogueCardsClientVariables),
)

export default enhance(RelatedProgrammes)