import * as React from "react";

import { Bot, BotWrapper } from "./styles";

import AssistantContent from "../containers/AssistantContent";
import { CSSTransition } from "react-transition-group";
import { IUser } from "modules/auth/types";
import { __ } from "coreui/utils";
import debounce from "lodash/debounce";

type Props = {
  currentUser: IUser;
};

type State = {
  currentRoute: string;
  showContent: boolean;
};

class Robot extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { currentRoute: "setupList", showContent: false };
  }

  changeRoute = (currentRoute: string) => {
    this.setState({ currentRoute });
  };

  renderContent = () => {
    const { currentUser } = this.props;

    return (
      <>
        <AssistantContent
          changeRoute={this.changeRoute}
          currentUser={currentUser}
          currentRoute={this.state.currentRoute}
          showContent={this.state.showContent}
          toggleContent={this.toggleContent}
        />
      </>
    );
  };

  toggleContent = (isShow: boolean) => {
    this.setState({ showContent: isShow }, () => {
      if (!isShow) {
        debounce(() => this.changeRoute("setupList"), 500)();
      }
    });
  };

  changeContent = () => {
    const { currentRoute } = this.state;

    if (currentRoute && !currentRoute.includes("setup")) {
      return;
    }

    return this.toggleContent(!this.state.showContent);
  };

  render() {
    return (
      <>
        {this.renderContent()}
        <CSSTransition
          in={true}
          appear={true}
          timeout={2600}
          classNames="robot"
        >
          <Bot onClick={this.changeContent}>
            <BotWrapper>
              <span>
                <img src="/images/erxes-bot.svg" alt="assistant robot" />
              </span>
            </BotWrapper>
          </Bot>
        </CSSTransition>
      </>
    );
  }
}

export default Robot;
