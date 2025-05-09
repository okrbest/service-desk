import Select from "react-select";
import React, { useState } from "react";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import {
  __,
  ControlLabel,
  FormControl,
  FormGroup,
  Toggle,
  Button,
  Tip,
} from "@erxes/ui/src";
import { IPmsBranch } from "../../types";
import { LeftItem } from "@erxes/ui/src/components/step/styles";
import {
  Block,
  BlockRow,
  FlexColumn,
  FlexItem,
  Description,
} from "../../styles";
import { FormColumn, FormWrapper } from "@erxes/ui/src/styles/main";

import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectBrands from "@erxes/ui/src/brands/containers/SelectBrands";

type Props = {
  onChange: (name: string, value: any) => void;
  branch: IPmsBranch;
};
const times = Array.from(
  { length: 24 },
  (_, hour) => `${hour.toString().padStart(2, "0")}:00`
);
const GeneralStep = (props: Props) => {
  const { branch, onChange } = props;

  let name = "PMS name";
  let description: any = "description";
  let time: string = "";

  let checkintime: string = "";
  let checkouttime: string = "";
  let checkinamount: number = 0;
  let checkoutamount: number = 0;
  if (branch) {
    name = branch.name || "";
    description = branch.description;
    time = branch.time || "";
    checkintime = branch.checkintime || "";
    checkouttime = branch.checkouttime || "";
    checkinamount = branch.checkinamount || 0;
    checkoutamount = branch.checkoutamount || 0;
  }

  const onChangeFunction = (name: any, value: any) => {
    onChange(name, value);
  };

  const onChangeInput = e => {
    onChangeFunction(e.target.id, (e.currentTarget as HTMLInputElement).value);
  };

  const onClickAddPayments = () => {
    const discountTypes = [...(branch.discount || [])];

    discountTypes.push({
      _id: Math.random().toString(),
      type: "",
      title: "",
      icon: "",
    });

    onChange("discount", discountTypes);
  };
  const renderPaymentType = (paymentType: any) => {
    const editPayment = (name, value) => {
      let discountTypes = [...(branch.discount || [])];
      discountTypes = (discountTypes || []).map(p =>
        p._id === paymentType._id ? { ...p, [name]: value } : p
      );
      onChange("discount", discountTypes);
    };

    const onChangeInput = e => {
      const name = e.target.name;
      const value = e.target.value;
      editPayment(name, value);
    };

    const removePayment = () => {
      const paymentTypes =
        (branch.paymentTypes || []).filter(m => m._id !== paymentType._id) ||
        [];
      onChange("discount", paymentTypes);
    };

    const getTipText = type => {
      return "";
    };

    return (
      <div key={paymentType._id}>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <FormControl
                name="type"
                maxLength={10}
                defaultValue={paymentType.type || ""}
                onChange={onChangeInput}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <FormControl
                name="title"
                type="text"
                defaultValue={paymentType.title || ""}
                onChange={onChangeInput}
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <Tip text={getTipText(paymentType.type)}>
                <FormControl
                  name="config"
                  type="text"
                  defaultValue={paymentType.config || ""}
                  onChange={onChangeInput}
                />
              </Tip>
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <Button
                btnStyle="danger"
                icon="trash"
                onClick={() => removePayment()}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      </div>
    );
  };

  return (
    <FlexItem>
      <FlexColumn>
        <LeftItem>
          <Block>
            <h4>{__("Branch")}</h4>
            <BlockRow>
              <FormGroup>
                <ControlLabel required={true}>Name</ControlLabel>
                <FormControl
                  id="name"
                  type="text"
                  value={name || ""}
                  onChange={onChangeInput}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  id="description"
                  type="text"
                  value={description || ""}
                  onChange={onChangeInput}
                />
              </FormGroup>

              {/* <FormGroup>
                <ControlLabel>Brand</ControlLabel>
                <SelectBrands
                  label={__('Choose brands')}
                  onSelect={brand =>
                    onChangeFunction('pos', {
                      ...pos,
                      scopeBrandIds: [brand],
                    })
                  }
                  initialValue={pos.scopeBrandIds}
                  multi={false}
                  name='selectedBrands'
                  customOption={{
                    label: 'No Brand (noBrand)',
                    value: '',
                  }}
                />
              </FormGroup> */}
            </BlockRow>
          </Block>

          <Block>
            <h4>{__("Time Check-in & Check-out")}</h4>

            <FormGroup>
              <ControlLabel>Time</ControlLabel>
              <FormControl
                id="time"
                value={time || ""}
                onChange={onChangeInput}
              />
            </FormGroup>
          </Block>
          <Block>
            <h5>{__("Check-in")}</h5>
            <BlockRow>
              <FormGroup>
                <ControlLabel>Check in</ControlLabel>
                <Select
                  options={times.map(x => ({ value: x, label: x }))}
                  id="checkintime"
                  value={{ value: checkintime, label: checkintime }}
                  onChange={x => {
                    onChange("checkintime", x?.value);
                  }}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel required={false}>Check in Amount</ControlLabel>
                <FormControl
                  id="checkinamount"
                  type="text"
                  value={checkinamount}
                  onChange={onChangeInput}
                />
              </FormGroup>
            </BlockRow>
          </Block>
          <Block>
            <h5>{__("Check-out")}</h5>
            <BlockRow>
              <FormGroup>
                <ControlLabel>Check out</ControlLabel>
                <Select
                  options={times.map(x => ({ value: x, label: x }))}
                  id="checkouttime"
                  value={{ value: checkouttime, label: checkouttime }}
                  onChange={x => {
                    onChange("checkouttime", x?.value);
                  }}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel required={false}>Check out Amount</ControlLabel>
                <FormControl
                  id="checkoutamount"
                  type="text"
                  value={checkoutamount}
                  onChange={onChangeInput}
                />
              </FormGroup>
            </BlockRow>
          </Block>
          <Block>
            <h4>{__("Discounts")}</h4>
            <FormGroup>
              <div key={Math.random()}>
                <FormWrapper>
                  <FormColumn>
                    <FormGroup>
                      <ControlLabel>Type</ControlLabel>
                    </FormGroup>
                  </FormColumn>
                  <FormColumn>
                    <FormGroup>
                      <ControlLabel>Title</ControlLabel>
                    </FormGroup>
                  </FormColumn>
                  <FormColumn>
                    <FormGroup>
                      <ControlLabel>Config</ControlLabel>
                    </FormGroup>
                  </FormColumn>

                  <FormColumn></FormColumn>
                </FormWrapper>
              </div>
              {(branch.discount || []).map(item => renderPaymentType(item))}
            </FormGroup>
            <Button
              btnStyle="primary"
              icon="plus-circle"
              onClick={onClickAddPayments}
            >
              Add another
            </Button>
          </Block>
        </LeftItem>
      </FlexColumn>
    </FlexItem>
  );
};

export default GeneralStep;
