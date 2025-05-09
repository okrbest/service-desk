import { BarItems } from "modules/layout/styles";
import Button from "modules/common/components/Button";
import DataWithLoader from "modules/common/components/DataWithLoader";
import { EMPTY_IMPORT_CONTENT } from "@erxes/ui-settings/src/constants";
import EmptyContent from "modules/common/components/empty/EmptyContent";
import HeaderDescription from "modules/common/components/HeaderDescription";
import HistoryRow from "./HistoryRow";
import { IImportHistory } from "../../../types";
import { Link, Location } from "react-router-dom";
import Pagination from "modules/common/components/pagination/Pagination";
import React from "react";
import Sidebar from "../../../common/containers/SideBar";
import Table from "modules/common/components/table";
import { Title } from "@erxes/ui-settings/src/styles";
import Wrapper from "modules/layout/components/Wrapper";
import { __ } from "coreui/utils";

type Props = {
  queryParams: Record<string, string>;
  location: Location;
  histories: IImportHistory[];
  loading: boolean;
  totalCount: number;
  currentType: string;
  removeHistory: (historyId: string, contentType: string) => void;
};

class Histories extends React.Component<Props> {
  renderHistories = () => {
    const { histories, removeHistory } = this.props;

    return (
      <Table $hover={true}>
        <thead>
          <tr>
            <th>{__("Name")}</th>
            <th>{__("Records")}</th>
            <th>{__("Updated records")}</th>
            <th>{__("Errors")}</th>
            <th>{__("User")}</th>
            <th>{__("Date")}</th>
            <th>{__("Action")}</th>
          </tr>
        </thead>
        <tbody>
          {histories.map((history) => {
            return (
              <HistoryRow
                key={history._id}
                history={history}
                removeHistory={removeHistory}
              />
            );
          })}
        </tbody>
      </Table>
    );
  };

  getButtonText() {
    const { currentType } = this.props;
    let buttonText = `${currentType}s`;

    switch (currentType) {
      case "company":
        buttonText = "companies";
        break;
      case "deal":
        buttonText = "sales pipelines";
        break;
      case "purchase":
        buttonText = "purchases pipelines";
        break;
      case "user":
        buttonText = "team members";
        break;
      default:
        buttonText = "";
        break;
    }

    return buttonText;
  }

  renderDataImporter() {
    const { currentType } = this.props;

    return (
      <Link to={`/settings/import?type=${currentType}`}>
        <Button icon="import" btnStyle="success">
          {__(`Import data`)}
        </Button>
      </Link>
    );
  }

  renderImportButton = () => {
    return <BarItems>{this.renderDataImporter()}</BarItems>;
  };

  render() {
    const { histories, loading, totalCount, location, currentType } =
      this.props;

    const breadcrumb = [
      { title: __("Settings"), link: "/settings" },
      { title: __("Import & Export"), link: "/settings/selectMenu" },
      { title: __("Imports") },
    ];

    const headerDescription = (
      <HeaderDescription
        icon="/images/actions/27.svg"
        title={__("Import")}
        description={`${__(
          "Here you can find data of all your previous imports of companies and customers"
        )}.${__("Find out when they joined and their current status")}.${__(
          "Nothing goes missing around here"
        )}`}
      />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__("Imports")} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title $capitalize={true}>{__("Imports")}</Title>}
            right={this.renderImportButton()}
            wideSpacing={true}
          />
        }
        leftSidebar={
          <Sidebar
            location={location}
            currentType={currentType}
            mainType="import"
          />
        }
        mainHead={headerDescription}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={this.renderHistories()}
            loading={loading}
            count={histories.length}
            emptyContent={<EmptyContent content={EMPTY_IMPORT_CONTENT} />}
          />
        }
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default Histories;
