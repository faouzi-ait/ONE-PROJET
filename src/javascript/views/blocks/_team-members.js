import React from 'react'
import ReactDOM from 'react-dom'

// Stores
import MembersStore from 'javascript/stores/team-members'

// Actions
import MembersActions from 'javascript/actions/team-members'

// Components
import Modal from 'javascript/components/modal'
import Card from 'javascript/components/card'
import TeamMemberShow from 'javascript/views/team-members/show'

export default (block, assets, props) => (
  <Block block={block} assets={assets} {...props}/>
)

class Block extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      resources: null,
      modal: () => {},
      title: props.block.title,
      department: props.block.department,
      region: props.block.region
    }
  }

  componentWillMount() {
    MembersStore.on('change', this.setResources)
  }

  componentWillUnmount() {
    MembersStore.removeListener('change', this.setResources)
  }

  componentDidMount() {
    this.getResources(this.state)
  }

  setResources = () => {
    this.setState({
      resources: MembersStore.getResources()
    })
  }

  getResources = () => {
    const actions = {
      include: 'team-department',
      fields: {
        'team-members': 'first-name,last-name,job-title,image,email,phone,bio,team-department,manager,producer-hub',
        'team-departments': 'name'
      },
      page: {
        size: 200
      },
    }
    if(this.state.region){
      actions['filter[team-region]'] = this.state.region?.id
    }
    if(this.state.department){
      actions['filter[team-department]'] = this.state.department?.id
    }
    MembersActions.getResources(actions)
  }

  unsetModal = callback => {
    if(this.refs.modal){
      ReactDOM.findDOMNode(this.refs.modal).classList.add('modal--is-hiding')
      setTimeout(() => {
        this.setState({
          modal: () => {}
        }, typeof callback === 'function' ? callback : () => {})
      }, 500)
    }
  }

  openMember = (resource) => () => {
    this.setState({
      modal: () => (
        <Modal ref="modal" customContent={true} closeEvent={this.unsetModal}>
          <TeamMemberShow resource={resource} closeEvent={this.unsetModal} />
        </Modal>
      )
    })
  }

  renderTeam = () => {
    const { resources } = this.state
    const items = resources.map((resource) => {
      return (
        <Card key={ resource.id }
          image={{ src: resource.image?.url }}
          onClick={this.openMember(resource)}
          size="people"
          title={`${resource['first-name']} ${resource['last-name']}`}
        >
          <>
            <h4 className="card__copy card__job">{resource['job-title']}</h4>
            {resource['team-region'] &&
              <p className="card__copy">{resource['team-region'].name}</p>
            }
          </>
        </Card>
      )
    })
    if (items.length > 0) {
      return (
        <div className="grid grid--four fade-on-load">
          { items }
        </div>
      )
    } else {
      return <div className="fade-on-load grid">There are no team members to show.</div>
    }
  }

  render() {
    return (
      <div>
        { this.state.title &&
          <h2 class="content-block__heading">{ this.state.title }</h2>
        }
        { this.state.resources && this.renderTeam() }
        { this.state.modal() }
      </div>
    )
  }
}