import React from "react";
import queryString from 'query-string'
import pluralize from 'pluralize'

import UserService from "javascript/services/users";
import UserStore from "javascript/stores/users";
import UserActions from "javascript/actions/users";

import Meta from "react-document-meta";
import PageHelper from "javascript/views/page-helper";
import PageLoader from "javascript/components/page-loader";
import ReportingBanner from "javascript/components/reporting/banner";
import Breadcrumbs from "javascript/components/breadcrumbs";
import AccountNavigation from 'javascript/components/account-navigation'
import ReportTabs from "javascript/components/reporting/tabs";
import ReportSearch from "javascript/components/reporting/search";
import Tabs from "javascript/components/tabs";

import SystemOverview from "javascript/views/reporting/user/reports/system-overview";
import SystemActivity from "javascript/views/reporting/user/reports/system-activity";
import UserOverview from "javascript/views/reporting/user/reports/user-overview";
import Videos from "javascript/views/reporting/user/reports/videos-watched";
import Programmes from "javascript/views/reporting/user/reports/programme-page-views";
import Lists from "javascript/views/reporting/user/reports/user-list";
import SmallScreenMessage from 'javascript/components/small-screen-message'
import compose from 'javascript/utils/compose'
import allClientVariables from 'javascript/views/reporting/variables'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'

class UserReports extends PageHelper {
  constructor(props) {
    super(props);
    this.params = queryString.parse(props.location.search)
    this.reportingPath = `/${props.theme.variables.SystemPages.account.path}/${props.theme.variables.SystemPages.reporting.path}`
    this.tabs = [
      `${this.reportingPath}/users`,
      `${this.reportingPath}/users/search`
    ]
    this.state = {
      selectedUser: null,
      users: [],
      query: ''
    };
  }

  componentWillMount() {
    UserStore.on("change", this.getUser);
  }

  componentDidMount() {
    this.fetchUserResource();
  }

  componentWillUnmount() {
    UserStore.removeListener("change", this.getUser);
  }

  navigate = ({value}) => {
    if (value === 0) {
      this.setState({
        selectedUser: null
      }, () => {
        this.props.history.push(`${this.reportingPath}/users`)
      })
    } else if(value === 1) {
      this.props.history.push(`${this.reportingPath}/users/search`)
    }
  }

  fetchUserResource = () => {
    if (!this.state.selectedUser && this.params && this.params.u) {
      UserActions.getResource(this.params.u, {
        include: "company,territories",
        fields: {
          users: "first-name,last-name,company,email,job-title,territories",
          territories: "name"
        },
        page: { size: "all" }
      });
    } else {
      this.finishedLoading();
    }
  };

  updateQuery = (e, { newValue }) => {
    this.setState({
      query: newValue
    })
  }

  searchForUser = (input) => {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      UserService.search(
        {
          include: "company,territories",
          fields: {
            users: "first-name,last-name,company,email,job-title,territories",
            territories: "name"
          },
          page: { size: "all" },
          filter: { search: input.value, "reporting-users-search": true }
        },
        response => {
          this.setState({
            users: response.map(person =>
              Object.assign(person, {
                label: `${person["first-name"]} ${person["last-name"]} : ${
                  person.company.name
                }`,
                value: person.id
              })
            )
          });
        }
      );
    }, 300);
  };

  getUser = () => {
    const user = UserStore.getResource()
    const label = `${user["first-name"]} ${user["last-name"]} : ${user.company?.name}`
    this.setState({
      selectedUser: {
        ...user,
        label,
        value: user.id
      },
      query: label
    });
    this.finishedLoading();
  };

  setUser = (value) => {
    this.setState(
      {
        selectedUser: value ? value :  null,
      },
      () => {
        let url = this.tabs[0]
        if (value){
          url = `${this.tabs[1]}?u=${value.id}`
        } else {
          this.params = null
        }
        this.props.history.push(url)
      }
    );
  };

  render() {
    const { theme, clientVariables } = this.props
    return (
      <Meta
        title={`${theme.localisation.client} :: Reports`}
        meta={{
          description: "View your reports"
        }}
      >
        <PageLoader {...this.state}>
          <main>
            <ReportingBanner theme={theme} />
            <Breadcrumbs
              paths={[
                { name: `${theme.variables.SystemPages.account.upper}`, url: `/${theme.variables.SystemPages.account.path}` },
                { name: theme.variables.SystemPages.reporting.upper, url: this.reportingPath },
                { name: "Users", url: `${this.reportingPath}/users` }
              ]}
              classes={clientVariables.breadcrumbClasses}
            />
            <AccountNavigation currentPage={`/${theme.variables.SystemPages.reporting.path}`} />
            <section className={clientVariables.sectionClasses}>
              <ReportTabs {...this.props} active={1} />
              <Tabs classes={"tabs--underline"} active={this.tabs.indexOf(this.props.location.pathname)} onChange={this.navigate}>
                <div
                  title="All my users"
                  subtitle="Overview of all your users' data combined">
                  <div>
                    <SystemOverview bg={clientVariables.blockBgClasses} />
                    <SystemActivity bg={clientVariables.blockBgClasses} selectUser={(object)=>{
                      object['id'] = object['user-id']
                      object['label'] = object['user']
                      this.setUser(object)
                    }}/>
                  </div>
                </div>

                <div
                  title="Individual users"
                  subtitle="Search for a specific user's data"
                >
                  <div style={{'minHeight': this.state.selectedUser ? '0' : '250px'}}>
                    <ReportSearch
                      modifiers={['reporting']}
                      onChange={this.updateQuery}
                      onSearch={this.searchForUser}
                      onReset={()=>this.setState({users: []})}
                      onClear={()=>{this.setUser(null); this.setState({query: ''})}}
                      suggestions={this.state.users}
                      onSelect={(item) => this.setUser(item.suggestion)}
                      value={this.state.query}
                      placeholder="Search for a user..." />
                    </div>
                  {this.state.selectedUser && (
                    <div>
                      <UserOverview user={this.state.selectedUser} bg={clientVariables.blockBgClasses} />
                      <Videos user={this.state.selectedUser} bg={clientVariables.blockBgClasses} />
                      <Programmes user={this.state.selectedUser} bg={clientVariables.blockBgClasses} selectProgramme={(programme)=>{
                        this.props.history.push(`${this.reportingPath}/${theme.localisation.programme.path}?p=${programme['programme-id']}`)
                      }} />
                      <Lists user={this.state.selectedUser} bg={clientVariables.blockBgClasses} />
                    </div>
                  )}
                </div>
              </Tabs>
            </section>
          </main>
          <SmallScreenMessage />
        </PageLoader>
      </Meta>
    );
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('clientVariables', allClientVariables)
)


export default enhance(UserReports)