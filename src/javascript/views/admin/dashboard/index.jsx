import React from "react";
import Meta from "react-document-meta";
import PageHelper from "javascript/views/page-helper";
import PageLoader from "javascript/components/page-loader";
import PageHeader from 'javascript/components/admin/layout/page-header'
import ProgrammesCard from "javascript/views/admin/dashboard/programmes"
import UsersCard from "javascript/views/admin/dashboard/users"
import AssetsCard from "javascript/views/admin/dashboard/assets"
import VideosCard from "javascript/views/admin/dashboard/videos"
import ActivityCard from "javascript/views/admin/dashboard/activity"
import FeaturesCard from "javascript/views/admin/dashboard/features"
import moment from 'moment'
import { isAdmin, hasPermission } from 'javascript/services/user-permissions'

export default class AdminDashboard extends PageHelper {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.finishedLoading();
  }

  render() {
    const date = moment().subtract(7, 'd')
    const {user, theme} = this.props
    return (
      <Meta
        title={`${theme.localisation.client} :: Admin`}
        meta={{
          description: "View your control panel"
        }}
      >
        <PageLoader {...this.state}>
          <main>
            <PageHeader title={ theme.localisation.client } subtitle={`ONE Admin`} classes={['branded']}>
              <p className="page-header__stats">This weeks stats from {date.format(theme.features.formats.shortDate)}</p>
            </PageHeader>
            <div className="container container--wide">
              <div className="grid grid--three">
                {(isAdmin(user) || hasPermission(user, ['manage_programmes']) || hasPermission(user, ['manage_programme_data_options'])) &&
                  <ProgrammesCard date={date.toDate()} user={user} />
                }
                {(isAdmin(user) || hasPermission(user, ['manage_users']) || hasPermission(user, ['manage_approvals'])) &&
                  <UsersCard date={date.toDate()} user={user} />
                }
                {(isAdmin(user) || hasPermission(user, ['manage_assets' ])) && theme.features.assets &&
                  <AssetsCard date={date.toDate()} user={user} />
                }
                {(isAdmin(user) || hasPermission(user, ['manage_videos' ])) &&
                  <VideosCard date={date.toDate()} user={user} />
                }
                {(isAdmin(user) || hasPermission(user, ['view_reporting' ])) && theme.features.reporting &&
                  <ActivityCard date={date.toDate()} user={user} />
                }
                {!theme.features.lite &&
                  <FeaturesCard />
                }
              </div>
            </div>
          </main>
        </PageLoader>
      </Meta>
    );
  }
}
