import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  LLOYDS,
  HALIFAX,
  BOS,
  MBNA,
  Main,
  Heading,
  Paragraph,
} from '@lbg/constellation';

import classnames from 'classnames';

import Footer from '../Footer';
import Header from '../Header';
import SideBar from '../SideBar';

import './styles.css';

const PageFrame = (
  { ariaHidden, children, heading, intro, noStationary, sidebar, withIframe },
  { brand }
) => {
  if (withIframe) {
    return (
      <div className="sca-page-frame__empty-page-merchant--outer">
        <div className="sca-page-frame__empty-page-merchant--inner">
          <div className="sca-page-frame__iframe-wrapper">
            {heading && (
              <div className="sca-page-frame__heading">
                <Heading>{heading}</Heading>
                {heading && <Paragraph variation="intro">{intro}</Paragraph>}
              </div>
            )}
            <div className="sca-page-frame__iframe-body">{children}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!noStationary) {
    // What classnames should be used, in respect of the sidebar being shown?
    const bodyClassname = classnames(
      'sca-page-body',
      sidebar === '' ? 'sca-page--no-sidebar' : null
    );

    return (
      <Fragment>
        <div className={`sca-page sca-brand-${brand}`}>
          <Main>
            <Header href="/" />
            <div className={bodyClassname}>
              <div className="sca-page-content csl-border">
                {heading && (
                  <div className="sca-page-frame__heading">
                    <Heading>{heading}</Heading>
                    {heading && <Paragraph>{intro}</Paragraph>}
                  </div>
                )}
                {children}
              </div>
              <SideBar sidebar={sidebar} />
            </div>
            <Footer />
          </Main>
        </div>
      </Fragment>
    );
  }

  return (
    <div aria-hidden={ariaHidden} tabIndex="-1">
      {children}
    </div>
  );
};

PageFrame.contextTypes = {
  brand: PropTypes.oneOf([BOS, HALIFAX, LLOYDS, MBNA]).isRequired,
};

PageFrame.defaultProps = {
  ariaHidden: false,
  heading: '',
  intro: '',
  noStationary: false,
  sidebar: '',
  withIframe: false,
};

PageFrame.propTypes = {
  ariaHidden: PropTypes.bool,
  children: PropTypes.node.isRequired,
  heading: PropTypes.string,
  intro: PropTypes.node,
  noStationary: PropTypes.bool,
  sidebar: PropTypes.string,
  withIframe: PropTypes.bool,
};

export default PageFrame;
