import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Info from '@erxes/ui/src/components/Info';
import { Step, Steps } from '@erxes/ui/src/components/step';
import {
  ControlWrapper,
  FlexItem,
  Indicator,
  LeftItem,
  Preview,
  StepWrapper,
} from '@erxes/ui/src/components/step/styles';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from 'coreui/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import SelectBrand from '@erxes/ui-inbox/src/settings/integrations/containers/SelectBrand';
import SelectChannels from '@erxes/ui-inbox/src/settings/integrations/containers/SelectChannels';
import {
  Content,
  ImageWrapper,
  MessengerPreview,
  TextWrapper,
} from '@erxes/ui-inbox/src/settings/integrations/styles';
import Accounts from '../containers/Accounts';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const Zalo = (props: Props) => {
  const [channelIds, setChannelIds] = useState([] as string[]);
  const [accountId, setAccountId] = useState('');

  const generateDoc = (values: { name: string; brandId: string }) => {
    return {
      ...values,
      kind: 'zalo',
      channelIds,
      accountId,
    };
  };

  const channelOnChange = (values: string[]) => {
    setChannelIds(values);
  };

  const onSelectAccount = (accountId: string) => {
    setAccountId(accountId);
  };

  const renderContent = (formProps: IFormProps) => {
    const { renderButton } = props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <Steps active={1}>
          <Step img="/images/icons/erxes-01.svg" title="Connect Zalo OA">
            <FlexItem>
              <LeftItem>
                <FormGroup>
                  <Info>
                    <strong>{__('How can i get a Zalo OA')}</strong>
                    <br />
                    {__('For register an account, go to this link:')}
                    <a href="https://oa.zalo.me/" target="_blank">
                      https://oa.zalo.me/
                    </a>
                  </Info>
                </FormGroup>

                <Accounts
                  // formProps={formProps}
                  renderButton={renderButton}
                  onSelectAccount={onSelectAccount}
                  accountId={accountId}
                />
              </LeftItem>
            </FlexItem>
          </Step>

          <Step
            img="/images/icons/erxes-16.svg"
            title={__("Integration Setup")}
            noButton={true}
          >
            <FlexItem>
              <LeftItem>
                <FormGroup>
                  <ControlLabel required={true}>Integration Name</ControlLabel>
                  <p>
                    {__('Name this integration to differentiate from the rest')}
                  </p>
                  <FormControl
                    {...formProps}
                    name="name"
                    required={true}
                    autoFocus={true}
                  />
                </FormGroup>

                <SelectBrand
                  isRequired={true}
                  formProps={formProps}
                  description={__(
                    'Which specific Brand does this integration belong to?',
                  )}
                />

                <SelectChannels
                  defaultValue={channelIds}
                  isRequired={true}
                  onChange={channelOnChange}
                />
              </LeftItem>
            </FlexItem>
          </Step>
        </Steps>
        <ControlWrapper>
          <Indicator>
            {__('You are creating')}
            <strong> {__('Zalo')}</strong> {__('integration')}
          </Indicator>
          <Button.Group>
            <Link to="/settings/integrations">
              <Button btnStyle="simple" icon="times-circle">
                Cancel
              </Button>
            </Link>
            {renderButton({
              values: generateDoc(values),
              isSubmitted,
            })}
          </Button.Group>
        </ControlWrapper>
      </>
    );
  };

  const renderForm = () => {
    return <Form renderContent={renderContent} />;
  };

  const title = __('Zalo');

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Integrations'), link: '/settings/integrations' },
    { title },
  ];

  return (
    <StepWrapper>
      <Wrapper.Header title={title} breadcrumb={breadcrumb} />
      <Content>
        {renderForm()}

        <MessengerPreview>
          <Preview fullHeight={true}>
            <ImageWrapper>
              <TextWrapper>
                <h1>
                  {__('Connect your')} {title}
                </h1>
                <p>
                  {__(
                    'Connect your Zalo to start receiving emails in your team inbox',
                  )}
                </p>
                <img alt={title} src="/images/previews/facebook.png" />
              </TextWrapper>
            </ImageWrapper>
          </Preview>
        </MessengerPreview>
      </Content>
    </StepWrapper>
  );
};

export default Zalo;
