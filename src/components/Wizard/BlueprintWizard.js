import React, { useState, useMemo, useCallback, memo } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@patternfly/react-core";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";
import componentTypes from "@data-driven-forms/react-form-renderer/component-types";
import {
  blueprintDetails,
  fdo,
  filesystem,
  kernel,
  packages,
  users,
  services,
  firewall,
  groups,
  sshkeys,
  timezone,
  locale,
  other,
  ignition,
  openscap,
  reviewBlueprint,
} from "../../forms/steps";
import {
  hostnameValidator,
  filesystemValidator,
  blueprintNameValidator,
} from "../../forms/validators";
import { selectAllImageTypes } from "../../slices/imagesSlice";
import { updateBlueprint } from "../../slices/blueprintsSlice";

import FormRenderer from "@data-driven-forms/react-form-renderer/form-renderer";
import Pf4FormTemplate from "@data-driven-forms/pf4-component-mapper/form-template";
import { componentMapper } from "@data-driven-forms/pf4-component-mapper";
import Packages from "../../forms/components/Packages";
import TextFieldCustom from "../../forms/components/TextFieldCustom";
import FileSystemConfigToggle from "../../forms/components/FileSystemConfigToggle";
import FileSystemConfiguration from "../../forms/components/FileSystemConfiguration";
import TextInputGroupWithChips from "../../forms/components/TextInputGroupWithChips";
import UploadFile from "../../forms/components/UploadFile";
import { blueprintToFormState, formStateToBlueprint } from "../../helpers";

const messages = defineMessages({
  editBlueprint: {
    defaultMessage: "Edit blueprint",
  },
  createBlueprint: {
    defaultMessage: "Create blueprint",
  },
  save: {
    defaultMessage: "Save",
  },
});

const FormRendererWrapper = memo(
  ({
    isWizardOpen,
    stableKey,
    initialValues,
    blueprint,
    imageTypes,
    intl,
    isEdit,
    onSave,
    onClose,
  }) => {
    if (!isWizardOpen) return null;

    return (
      <FormRenderer
        key={stableKey}
        initialValues={initialValues}
        blueprint={blueprint}
        imageTypes={imageTypes}
        FormTemplate={(props) => (
          <Pf4FormTemplate {...props} showFormControls={false} />
        )}
        onSubmit={onSave}
        validatorMapper={{
          hostnameValidator,
          filesystemValidator,
          blueprintNameValidator,
        }}
        componentMapper={{
          ...componentMapper,
          "package-selector": Packages,
          "text-field-custom": TextFieldCustom,
          "filesystem-toggle": FileSystemConfigToggle,
          "filesystem-configuration": FileSystemConfiguration,
          "text-input-group-with-chips": TextInputGroupWithChips,
          "upload-file": UploadFile,
        }}
        onCancel={onClose}
        schema={{
          fields: [
            {
              component: componentTypes.WIZARD,
              name: "blueprint-wizard",
              inModal: true,
              showTitles: true,
              title: isEdit
                ? intl.formatMessage(messages.editBlueprint)
                : intl.formatMessage(messages.createBlueprint),
              buttonLabels: {
                submit: intl.formatMessage(messages.save),
              },
              onKeyDown: (event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                }
              },
              fields: [
                blueprintDetails(intl),
                packages(intl),
                kernel(intl),
                filesystem(intl),
                services(intl),
                firewall(intl),
                users(intl),
                groups(intl),
                sshkeys(intl),
                timezone(intl),
                locale(intl),
                other(intl),
                fdo(intl),
                openscap(intl),
                ignition(intl),
                reviewBlueprint(intl),
              ],
              initialState: {
                activeStep: "blueprint-details",
                activeStepIndex: 0,
                prevSteps: [
                  "blueprint-details",
                  "packages",
                  "kernel",
                  "filesystem",
                  "services",
                  "firewall",
                  "users",
                  "groups",
                  "sshkeys",
                  "timezone",
                  "locale",
                  "other",
                  "fdo",
                  "openscap",
                  "ignition",
                  "review-blueprint",
                ],
                maxStepIndex: 15,
              },
            },
          ],
        }}
      />
    );
  }
);

FormRendererWrapper.displayName = "FormRendererWrapper";

FormRendererWrapper.propTypes = {
  isWizardOpen: PropTypes.bool.isRequired,
  stableKey: PropTypes.string,
  initialValues: PropTypes.object,
  blueprint: PropTypes.object,
  imageTypes: PropTypes.array,
  intl: PropTypes.object.isRequired,
  isEdit: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

const BlueprintWizard = (props) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const imageTypes = useSelector((state) => selectAllImageTypes(state));

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [stableKey, setStableKey] = useState(null);

  const handleClose = useCallback(() => {
    setIsWizardOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setIsWizardOpen(true);
    setStableKey(`wizard-${Date.now()}`);
  }, []);

  const handleSaveBlueprint = useCallback(
    (formValues, formApi) => {
      // this is necessary because swapping steps doesn't always update the formValues but calling getState() provides them
      // the key check is necessary because the formvalues object can contain an undefined key value of {undefined: undefined}
      // the reason it is a string "undefined" is because javascript
      const formState =
        Object.keys(formValues)[0] !== "undefined"
          ? formValues
          : formApi.getState().values;
      const blueprintData = formStateToBlueprint(formState);
      dispatch(updateBlueprint(blueprintData));
      handleClose();
      window.location.href = `#/${blueprintData.name}`;
    },
    [dispatch, handleClose]
  );

  const initialValues = useMemo(() => {
    const values = props.isEdit ? blueprintToFormState(props.blueprint) : {};
    values["isEdit"] = props.isEdit;
    return values;
  }, [props.isEdit, props.blueprint?.name, isWizardOpen]);

  return (
    <>
      <Button variant="secondary" onClick={handleOpen}>
        {props.isEdit ? (
          <FormattedMessage defaultMessage="Edit blueprint" />
        ) : (
          <FormattedMessage defaultMessage="Create blueprint" />
        )}
      </Button>
      <FormRendererWrapper
        isWizardOpen={isWizardOpen}
        stableKey={stableKey}
        initialValues={initialValues}
        blueprint={props.blueprint}
        imageTypes={imageTypes}
        intl={intl}
        isEdit={props.isEdit}
        onSave={handleSaveBlueprint}
        onClose={handleClose}
      />
    </>
  );
};

BlueprintWizard.propTypes = {
  blueprint: PropTypes.object,
  isEdit: PropTypes.bool,
};

export default BlueprintWizard;
