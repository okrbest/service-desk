import * as compose from "lodash.flowright";

import { EditMutationResponse, ICustomer } from "../types";

import { FieldsGroupsQueryResponse } from "@erxes/ui-forms/src/settings/properties/types";
import GenerateCustomFields from "@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields";
import React from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import Spinner from "@erxes/ui/src/components/Spinner";
import { queries as fieldQueries } from "@erxes/ui-forms/src/settings/properties/graphql";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { mutations } from "../graphql";
import { withProps } from "@erxes/ui/src/utils";

type Props = {
  customer: ICustomer;
  loading?: boolean;
  showType?: string;
  isDetail: boolean;
  collapseCallback?: () => void;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props &
  EditMutationResponse;

const CustomFieldsSection = (props: FinalProps) => {
  const {
    customer,
    customersEdit,
    fieldsGroupsQuery,
    loading,
    isDetail,
    showType,
    collapseCallback,
  } = props;

  if (fieldsGroupsQuery && fieldsGroupsQuery.loading) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }

  const { _id } = customer;

  const save = (variables, callback) => {
    customersEdit({
      variables: { _id, ...variables },
    })
      .then(() => {
        callback();
      })
      .catch((e) => {
        callback(e);
      });
  };

  const updatedProps = {
    save,
    loading,
    customFieldsData: customer.customFieldsData,
    fieldsGroups: fieldsGroupsQuery ? fieldsGroupsQuery.fieldsGroups : [],
    isDetail,
    showType,
    object: customer,
    collapseCallback,
  };

  return <GenerateCustomFields {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
      gql(fieldQueries.fieldsGroups),
      {
        name: "fieldsGroupsQuery",
        options: () => ({
          variables: {
            contentType: "core:customer",
            isDefinedByErxes: false,
          },
        }),
      }
    ),

    // mutations
    graphql<Props, EditMutationResponse, ICustomer>(
      gql(mutations.customersEdit),
      {
        name: "customersEdit",
        options: () => ({
          refetchQueries: ["customerDetail"],
        }),
      }
    )
  )(CustomFieldsSection)
);
