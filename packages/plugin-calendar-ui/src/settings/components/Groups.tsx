import { IBoard, ICalendar, IGroup } from "../types";
import { IButtonMutateProps } from "@erxes/ui/src/types";

import Button from "@erxes/ui/src/components/Button";
import { CALENDAR_INTEGRATIONS } from "../constants";
import CalendarForm from "./CalendarForm";
import { Count } from "@erxes/ui/src/styles/main";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import GroupForm from "../containers/GroupForm";
import GroupRow from "./GroupRow";
import Icon from "@erxes/ui/src/components/Icon";
import React from "react";
import Table from "@erxes/ui/src/components/table";
import { Title } from "@erxes/ui-settings/src/styles";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "coreui/utils";

type Props = {
  groups: IGroup[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  updateOrder?: any;
  remove: (group: IGroup) => void;
  boardId: string;
  refetch: ({ boardId }: { boardId?: string }) => Promise<any>;
  currentBoard?: IBoard;
  customLink: (kind: string) => void;
  removeCalendar: (calendar: ICalendar) => void;
  renderCalendarButton: (props: IButtonMutateProps) => JSX.Element;
  location: any;
};

type State = {
  showModal: boolean;
  groups: IGroup[];
  showCalendarModal: boolean;
};

class Groups extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const showCalendarModal =
      props.location.hash.includes("showCalendarModal");

    this.state = {
      showModal: false,
      groups: props.groups || [],
      showCalendarModal,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.groups !== this.props.groups) {
      this.setState({ groups: nextProps.groups });
    }
  }

  renderAddForm = () => {
    const { boardId, renderButton } = this.props;

    const closeModal = () => this.setState({ showModal: false });

    return (
      <GroupForm
        boardId={boardId}
        renderButton={renderButton}
        show={this.state.showModal}
        closeModal={closeModal}
      />
    );
  };

  renderCalendarForm = () => {
    const { renderCalendarButton, groups } = this.props;

    const closeModal = () => {
      this.setState({ showCalendarModal: false });
    };

    return (
      <CalendarForm
        renderButton={renderCalendarButton}
        closeModal={closeModal}
        show={this.state.showCalendarModal}
        groups={groups}
      />
    );
  };

  addGroup = () => {
    this.setState({
      showModal: true,
    });
  };

  connectCalendar = (kind: string) => {
    this.props.customLink(kind);
  };

  renderRows() {
    const { renderButton, removeCalendar, renderCalendarButton } = this.props;
    const { groups } = this.state;

    return groups.map((group) => (
      <GroupRow
        key={group._id}
        group={group}
        renderButton={renderButton}
        remove={this.props.remove}
        groups={this.props.groups}
        removeCalendar={removeCalendar}
        renderCalendarButton={renderCalendarButton}
      />
    ));
  }

  renderContent() {
    const { groups } = this.props;

    if (groups.length === 0) {
      return (
        <EmptyState
          text="Get started on your group"
          size="full"
          image="/images/actions/16.svg"
        />
      );
    }

    return (
      <>
        <Count>
          {groups.length} {__("group")}
          {groups.length > 1 && "s"}
        </Count>
        <Table>
          <tbody>{this.renderRows()}</tbody>
        </Table>
      </>
    );
  }

  addButton() {
    const { groups } = this.props;

    if (groups.length === 0) {
      return null;
    }

    return (
      <Dropdown
        // className="dropdown-btn"
        // alignRight={true}
        as={DropdownToggle}
        toggleComponent={
          <Button btnStyle="simple">
            {__("Add calendar")} <Icon icon="angle-down" />
          </Button>
        }
      >
        {CALENDAR_INTEGRATIONS.map((i) => (
          <li key={i.kind}>
            <a
              href={`#${i.kind}`}
              onClick={this.connectCalendar.bind(this, i.kind)}
            >
              {i.name}
            </a>
          </li>
        ))}
      </Dropdown>
    );
  }

  renderButton() {
    const { boardId } = this.props;

    if (!boardId) {
      return null;
    }

    return (
      <>
        {this.addButton()}
        <Button btnStyle="success" icon="plus-circle" onClick={this.addGroup}>
          Add group
        </Button>
      </>
    );
  }

  render() {
    const { currentBoard } = this.props;

    const leftActionBar = (
      <Title>{currentBoard ? currentBoard.name : ""}</Title>
    );

    return (
      <>
        <Wrapper.ActionBar left={leftActionBar} right={this.renderButton()} />

        {this.renderContent()}
        {this.renderAddForm()}
        {this.renderCalendarForm()}
      </>
    );
  }
}

export default Groups;
