import React, { useState, useEffect } from 'react';
import { __ } from '@erxes/ui/src/utils';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import ContentTypeList from '../containers/contentTypes/List';
import EntriesList from '../containers/entries/List';
import Pages from '../containers/pages/Pages';
import SideBar from './Sidebar';

type Props = {
  step: string;
  queryParams: any;
  history: any;
  contentTypes: any;
};

function WebBuilder(props: Props) {
  const [Component, setComponent] = useState(<div />);
  const [RightActionBar, setRightActionBar] = useState(<div />);
  const { step, queryParams, history, contentTypes } = props;

  useEffect(() => {
    switch (step) {
      case 'contenttypes':
        setComponent(
          <ContentTypeList
            queryParams={queryParams}
            history={history}
            getActionBar={setRightActionBar}
          />
        );

        break;

      case 'entries':
        setComponent(
          <EntriesList
            queryParams={queryParams}
            history={history}
            getActionBar={setRightActionBar}
          />
        );

        break;

      case 'pages':
        setComponent(<Pages getActionBar={setRightActionBar} />);

        break;

      default:
        setComponent(<div />);
    }
  }, [step]);

  const breadcrumb = [{ title: __('Webbuilder') }];

  return (
    <>
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Webbuilder Entries')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            right={RightActionBar}
            withMargin={true}
            wide={true}
            background="colorWhite"
          />
        }
        leftSidebar={
          <SideBar
            history={history}
            queryParams={queryParams}
            type={step}
            contentTypes={contentTypes}
          />
        }
        content={
          <DataWithLoader
            data={Component}
            loading={false}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        hasBorder={true}
        transparent={true}
        noPadding={true}
      />
    </>
  );
}

export default WebBuilder;
