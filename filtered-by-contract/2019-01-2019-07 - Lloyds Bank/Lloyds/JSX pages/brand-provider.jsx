import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Translation } from 'react-i18next';
import { LLOYDS, HALIFAX, BOS, MBNA, BrandProvider } from '@lbg/constellation';
import { ChannelProvider, TranslationProvider } from 'sca-ui/esm';
import constants from '../../constants/configuration';
import '../../helpers/i18n';
import Home from '../Home';

const brandSelector = props => props.match.params.brand;

class Brand extends Component {
  constructor(props) {
    super(props);
    const brand = brandSelector(this.props);
    import(`@lbg/constellation/dist/${brand}.css`).catch(() => {});
  }

  render() {
    const {
      match: {
        params: { brand, channel },
      },
    } = this.props;

    return (
      <BrandProvider brand={brand}>
        <ChannelProvider channel={channel}>
          <Translation lng={brand} ns={channel}>
            {t => (
              <TranslationProvider translate={t}>
                <Home brand={brand} />
              </TranslationProvider>
            )}
          </Translation>
        </ChannelProvider>
      </BrandProvider>
    );
  }
}

Brand.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      brand: PropTypes.oneOf([LLOYDS, HALIFAX, BOS, MBNA]),
      channel: PropTypes.oneOf(constants.channels),
    }),
  }).isRequired,
};

export default Brand;
