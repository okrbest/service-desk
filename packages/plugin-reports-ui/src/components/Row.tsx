import * as dayjs from "dayjs";

import {
  ActionButtons,
  Button,
  FormControl,
  Icon,
  NameCard,
  Tags,
  Tip,
} from "@erxes/ui/src/components";

import { FlexCenter } from "@erxes/ui/src/styles/main";
import { IReport } from "../types";
import { Link } from "react-router-dom";
import React from "react";
import { __ } from "coreui/utils";

type Props = {
  report: IReport;
  navigate: any;
  isChecked: boolean;
  toggleReport: (reportId: string, isChecked?: boolean) => void;
  removeReports: (reportIds: string[], callback?: any) => void;
};

const Row = (props: Props) => {
  const { report, navigate, isChecked, toggleReport, removeReports } = props;

  const { updatedBy, createdBy } = report;

  const editAction = () => {
    return (
      <Link to={`/reports/details/${report._id}`}>
        <Button btnStyle="link">
          <Tip text={__("Edit")} placement="top">
            <Icon icon="edit-3" />
          </Tip>
        </Button>
      </Link>
    );
  };
  const removeAction = () => {
    const onRemove = () => removeReports([report._id]);

    return (
      <Tip text={__("Delete")} placement="top">
        <Button
          id="dashboardDelete"
          btnStyle="link"
          onClick={onRemove}
          icon="times-circle"
        />
      </Tip>
    );
  };

  const onCheckReport = (e) => {
    if (toggleReport) {
      toggleReport(report._id, e.target.checked);
    }
  };

  const onNameClick = () => {
    navigate(`/reports/details/${report._id}`);
  };

  const returnFormattedDateTime = (dateVal: Date) => {
    const date = dayjs(dateVal).format("DD/MM/YYYY");
    const time = dayjs(dateVal).format("HH:mm");

    return `${date} ${time}`;
  };

  return (
    <tr>
      <td>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onCheckReport}
        />
      </td>

      <td onClick={onNameClick}>{report.name}</td>

      <td className="text-primary">
        <Icon icon="swatchbook" /> <b>{report.chartsCount || 0}</b>
      </td>

      <td>
        <FlexCenter>
          <NameCard user={updatedBy} avatarSize={30} />
        </FlexCenter>
      </td>
      <td>
        <FlexCenter>
          <NameCard user={createdBy} avatarSize={30} />
        </FlexCenter>
      </td>

      <td>
        <Icon icon="calendar" />
        <span>
          {report.updatedAt
            ? returnFormattedDateTime(new Date(report.updatedAt))
            : "-"}
        </span>
      </td>
      <td>
        <Icon icon="calendar" />
        <span>
          {report.createdAt
            ? returnFormattedDateTime(new Date(report.createdAt))
            : "-"}
        </span>
      </td>
      <td>
        <Tags tags={report.tags || []} limit={3} />
      </td>

      <td>
        <ActionButtons>
          {editAction()}
          {removeAction()}
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
