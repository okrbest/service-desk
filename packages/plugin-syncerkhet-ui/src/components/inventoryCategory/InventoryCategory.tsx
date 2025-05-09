import { CollapseContent, Pagination } from "@erxes/ui/src/components";
import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import Table from "@erxes/ui/src/components/table";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "coreui/utils";
import React from "react";
import Row from "./InventoryCategoryRow";
import { menuSyncerkhet } from "../../constants";
import { Title } from "@erxes/ui-settings/src/styles";
import { ContentBox } from "../../styles";

type Props = {
  loading: boolean;
  queryParams: any;
  toCheckCategories: () => void;
  toSyncCategories: (action: string, categories: any[]) => void;
  items: any;
};

type State = {
  openCollapse: number;
  loading: boolean;
};

class InventoryCategory extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      openCollapse: -1,
      loading: false,
    };
  }

  renderRow = (data: any, action: string) => {
    return data.map((c) => <Row key={c.code} category={c} action={action} />);
  };
  calculatePagination = (data: any) => {
    const { queryParams } = this.props;

    if (Object.keys(queryParams).length !== 0) {
      if (queryParams.perPage !== undefined && queryParams.page == undefined) {
        data = data.slice(queryParams.perPage * 0, queryParams.perPage * 1);
      }

      if (queryParams.page !== undefined) {
        if (queryParams.perPage !== undefined) {
          data = data.slice(
            Number(queryParams.page - 1) * queryParams.perPage,
            Number((queryParams.page - 1) * queryParams.perPage) +
              Number(queryParams.perPage)
          );
        } else {
          data = data.slice(
            (queryParams.page - 1) * 20,
            (queryParams.page - 1) * 20 + 20
          );
        }
      }
    } else {
      data = data.slice(0, 20);
    }

    return data;
  };

  excludeSyncTrue = (data: any) => {
    return data.filter((d) => d.syncStatus === false);
  };

  renderTable = (data: any, action: string) => {
    data = this.calculatePagination(data);
    const onClickSync = () => {
      data = this.excludeSyncTrue(data);
      this.props.toSyncCategories(action, data);
    };

    const syncButton = (
      <>
        <Button btnStyle="success" icon="check-circle" onClick={onClickSync}>
          Sync
        </Button>
      </>
    );

    const header = (
      <Wrapper.ActionBar
        left={<Title>{__(`Categories`)}</Title>}
        right={syncButton}
        background="colorWhite"
        wideSpacing={true}
      />
    );

    const content = (
      <Table $hover={true}>
        <thead>
          <tr>
            <th>{__("Code")}</th>
            <th>{__("Name")}</th>
            {action === "UPDATE" ? <th>{__("Update Status")}</th> : <></>}
            {action === "CREATE" ? <th>{__("Create Status")}</th> : <></>}
            {action === "DELETE" ? <th>{__("Delete Status")}</th> : <></>}
          </tr>
        </thead>
        <tbody>{this.renderRow(data, action)}</tbody>
      </Table>
    );

    return (
      <>
        {header}
        <DataWithLoader
          data={content}
          loading={false}
          count={data.length}
          emptyText={"Please sync again."}
          emptyIcon="leaf"
          size="large"
          objective={true}
        />
      </>
    );
  };

  render() {
    const { items } = this.props;
    const { openCollapse } = this.state;

    const onClickCheck = () => {
      this.props.toCheckCategories();
    };

    const checkOpenCollapse = (num: number): boolean => {
      return openCollapse === num ? true : false;
    };

    const onChangeCollapse = (num: number): void => {
      if (num !== openCollapse) {
        this.setState({ loading: true });

        this.setState({ openCollapse: num }, () => {
          this.setState({ loading: false });
        });
      }
    };

    const checkButton = (
      <Button btnStyle="success" icon="check-circle" onClick={onClickCheck}>
        Check
      </Button>
    );

    const content = (
      <ContentBox>
        <br />
        <CollapseContent
          title={__(
            "Create categories" +
              (items.create ? ":  " + items.create.count : "")
          )}
          id={"1"}
          onClick={() => {
            onChangeCollapse(1);
          }}
          open={checkOpenCollapse(1)}
        >
          <>
            <DataWithLoader
              data={
                items.create
                  ? this.renderTable(items.create?.items, "CREATE")
                  : []
              }
              loading={false}
              emptyText={"Please check first."}
              emptyIcon="leaf"
              size="large"
              objective={true}
            />
            <Pagination count={items.create?.count || 0} />
          </>
        </CollapseContent>
        <CollapseContent
          title={__(
            "Update categories" +
              (items.update ? ":  " + items.update.count : "")
          )}
          id={"2"}
          onClick={() => {
            onChangeCollapse(2);
          }}
          open={checkOpenCollapse(2)}
        >
          <>
            <DataWithLoader
              data={
                items.update
                  ? this.renderTable(items.update.items, "UPDATE")
                  : []
              }
              loading={false}
              emptyText={"Please check first."}
              emptyIcon="leaf"
              size="large"
              objective={true}
            />
            <Pagination count={items.update?.count || 0} />
          </>
        </CollapseContent>
        <CollapseContent
          title={__(
            "Delete categories" +
              (items.delete ? ":  " + items.delete.count : "")
          )}
          id={"3"}
          onClick={() => {
            onChangeCollapse(3);
          }}
          open={checkOpenCollapse(3)}
        >
          <>
            <DataWithLoader
              data={
                items.delete
                  ? this.renderTable(items.delete.items, "DELETE")
                  : []
              }
              loading={false}
              emptyText={"Please check first."}
              emptyIcon="leaf"
              size="large"
              objective={true}
            />
            <Pagination count={items.delete?.count || 0} />
          </>
        </CollapseContent>
      </ContentBox>
    );
    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Check category`)}
            queryParams={this.props.queryParams}
            submenu={menuSyncerkhet}
          />
        }
        content={
          <DataWithLoader
            data={content}
            loading={this.props.loading || this.state.loading}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__(`Categories`)}</Title>}
            right={checkButton}
            background="colorWhite"
            wideSpacing={true}
          />
        }
        hasBorder={true}
        transparent={true}
      />
    );
  }
}

export default InventoryCategory;
