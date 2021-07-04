import React from "react";
import {
  DateInput,
  Limit,
  Precision,
  Platform
} from "javascript/components/reporting/controls";
import moment from "moment";

const withQueryControls = (controlsSet = []) => WrappedComponent => {
  class WithQueryControls extends React.Component {
    state = {
      dateFrom: moment()
        .subtract(7, "days")
        .format("YYYY-MM-DD").toString(),
      dateTo: moment().format("YYYY-MM-DD").toString(),
      platform: "app,web",
      precision: "daily",
      limit: "10"
    };

    onQueryChange = name => event => {
      if (event.target) {
        this.setState({
          [name]: event.target.value
        });
      } else {
        this.setState({
          [name]: event.format("YYYY-MM-DD").toString()
        });
      }
    };

    dateFrom() {
      return (
        <DateInput
          value={this.state.dateFrom}
          onChange={this.onQueryChange("dateFrom")}
        >
          From
        </DateInput>
      );
    }

    dateTo() {
      return (
        <DateInput
          value={this.state.dateTo}
          onChange={this.onQueryChange("dateTo")}
        >
          To
        </DateInput>
      );
    }

    limit() {
      return (
        <Limit
          value={this.state.limit}
          onChange={this.onQueryChange("limit")}
        />
      );
    }

    precision() {
      return (
        <Precision
          value={this.state.precision}
          onChange={this.onQueryChange("precision")}
        />
      );
    }

    platform() {
      return (
        <Platform
          value={this.state.platform}
          onChange={this.onQueryChange("platform")}
        />
      );
    }

    queryKey(name) {
      return {
        dateFrom: "filter[date-from]",
        dateTo: "filter[date-to]",
        limit: "page[limit]",
        precision: "filter[precision]",
        platform: "filter[platform]"
      }[name];
    }

    queryForControlsSet() {
      return controlsSet.reduce(
        (query, name) => ({
          ...query,
          [this.queryKey(name)]: this.state[name]
        }),
        {}
      );
    }

    render() {
      return (
        <WrappedComponent
          queryControls={{
            dateFrom: this.dateFrom(),
            dateTo: this.dateTo(),
            limit: this.limit(),
            platform: this.platform(),
            precision: this.precision()
          }}
          query={this.queryForControlsSet()}
          {...this.props}
        />
      );
    }
  }

  WithQueryControls.displayName = `WithQueryControls(${getDisplayName(
    WrappedComponent
  )})`;
  return WithQueryControls;
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

export default withQueryControls;