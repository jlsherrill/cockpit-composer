/* eslint-disable react/display-name */
import React from "react";
import { FormattedMessage } from "react-intl";
import store from "../../store";

const blueprintNameValidator = () => (value, allValues) => {
  // If we're editing a blueprint, don't validate the name
  if (allValues.isEdit) {
    return undefined;
  }

  // Get blueprint names from Redux state directly
  const state = store.getState();
  const blueprintNames = state.blueprints.ids;

  if (blueprintNames && blueprintNames.includes(value)) {
    return (
      <FormattedMessage defaultMessage="A blueprint with this name already exists." />
    );
  }
  if (value.match(/\s/)) {
    return (
      <FormattedMessage defaultMessage="Blueprint names cannot have spaces." />
    );
  }
  return undefined;
};

export default blueprintNameValidator;
