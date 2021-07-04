import React from "react";

import Icon from "javascript/components/icon";

import "stylesheets/core/components/remove-button";

export default props => (
  <button type="button" className="remove-button" {...props}>
    <Icon id="i-close" width="10" height="10" />
  </button>
);
