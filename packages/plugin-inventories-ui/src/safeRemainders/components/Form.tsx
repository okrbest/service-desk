import { queries as formQueries } from "@erxes/ui-forms/src/forms/graphql";
import { IAttachment } from "@erxes/ui/src/types";
import Datetime from "@nateradebaugh/react-datetime";
import React, { useState } from "react";
import Select from "react-select";
// erxes
import { gql } from "@apollo/client";
import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";
import client from "@erxes/ui/src/apolloClient";
import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import CommonForm from "@erxes/ui/src/components/form/Form";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import Uploader from "@erxes/ui/src/components/Uploader";
import { FlexContent, FlexItem } from "@erxes/ui/src/layout/styles";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { __ } from "coreui/utils";
import { isEnabled } from "@erxes/ui/src/utils/core";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

export default function FormComponent(props: Props) {
  const { renderButton, closeModal } = props;

  // Hooks
  const [branchId, setBranchId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [attachment, setAttachment] = useState<IAttachment | undefined>(
    undefined
  );
  const [fieldsCombined, setFieldsCombined] = useState<any[]>([]);
  const [filterField, setFilterField] = useState<string>("");

  // Methods
  const generateDoc = (values: {}) => {
    const finalValues = values;

    return {
      ...finalValues,
      branchId,
      departmentId,
      date,
      description,
      productCategoryId: categoryId,
      attachment,
      filterField
    };
  };

  const changeAttachment = files => {
    setAttachment(files.length ? files[0] : undefined);

    client
      .query({
        query: gql(formQueries.fieldsCombinedByContentType),
        variables: {
          contentType: "core:product"
        }
      })
      .then(({ data }) => {
        setFieldsCombined(data?.fieldsCombinedByContentType || []);
      });
  };

  const renderFilterField = () => {
    if (!attachment) {
      return <></>;
    }

    const option = (fieldsCombined || []).map(f => ({
      value: f.name,
      label: f.label
    }));

    return (
      <FormGroup>
        <ControlLabel>{__("Choose B filter field")}</ControlLabel>
        <Select
          value={option.find(o => o.value === (filterField || ""))}
          onChange={option =>
            setFilterField(!option ? "" : option.value.toString())
          }
          isClearable={true}
          options={option}
        />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FlexContent>
          <FlexItem>
            <FormGroup>
              <ControlLabel>{__("Date")}</ControlLabel>
              <Datetime
                inputProps={{ placeholder: __("Click to select a date") }}
                dateFormat="YYYY-MM-DD"
                timeFormat=""
                viewMode={"days"}
                closeOnSelect
                utc
                input
                value={date}
                onChange={(date: any) => setDate(new Date(date || new Date()))}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel required>Description</ControlLabel>
              <FormControl
                {...formProps}
                name="description"
                defaultValue={description}
                onChange={(event: any) =>
                  setDescription(
                    (event.currentTarget as HTMLButtonElement).value
                  )
                }
                autoFocus
                required
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>{__("Branch")}</ControlLabel>
              <SelectBranches
                label={__("Choose branch")}
                name="selectedBranchIds"
                initialValue={branchId}
                onSelect={(branchId: any) => setBranchId(String(branchId))}
                multi={false}
                customOption={{ value: "", label: __("All branches") }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__("Department")}</ControlLabel>
              <SelectDepartments
                label={__("Choose department")}
                name="selectedDepartmentIds"
                initialValue={departmentId}
                onSelect={(departmentId: any) =>
                  setDepartmentId(String(departmentId))
                }
                multi={false}
                customOption={{ value: "", label: __("All departments") }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__("Product Categories")}</ControlLabel>
              <SelectProductCategory
                label={__("Choose product category")}
                name="selectedProductCategoryId"
                initialValue={categoryId}
                onSelect={(categoryId: any) =>
                  setCategoryId(categoryId as string)
                }
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Attach file</ControlLabel>
              <p>
                {__(
                  "xls file: A=>info, B=>filter, C=>changeCount || D=>lastCount"
                )}
              </p>
              <Uploader
                defaultFileList={attachment ? [attachment] : []}
                onChange={files => changeAttachment(files)}
                multiple={false}
                single={true}
              />
            </FormGroup>
            {renderFilterField()}
          </FlexItem>
        </FlexContent>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: "product and service",
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
}
