import React from 'react';
import { ContentHeader, HeaderContent, HeaderItems } from '../styles';

type Props = {
  left?: React.ReactNode;
  right?: React.ReactNode;
  bottom?: React.ReactNode;
  background?: string;
  zIndex?: number;
  hasFlex?: boolean;
};

function ActionBar({ left, right, background, bottom, zIndex, hasFlex }: Props) {
  return (
    <ContentHeader background={background || 'bgLight'} zIndex={zIndex}>
      <HeaderContent>
        {left && <HeaderItems hasFlex={hasFlex}>{left}</HeaderItems>}
        {right && <HeaderItems rightAligned={true}>{right}</HeaderItems>}
      </HeaderContent>
      {bottom}
    </ContentHeader>
  );
}

export default ActionBar;
