/* eslint-disable */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  Dropdown,
  Icon,
  Link,
  Option,
  Paragraph,
} from '@lbg/constellation';

import utilities from '../../helpers/utilities';

import CancelDialog from '../../components/CancelDialog';
import GenericNotification from '../../components/GenericNotification';
import LinksBar from '../../components/LinksBar';

import './styles.css';

/**
 * The MI template, used to gather memorable information during the login process
 *
 * @param {object} props - properties pass to and used by the component, @see propTypes
 */
class MI extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dialogIsOpen: false,
    };
  }

  hideDialog(e = null) {
    if (e) e.preventDefault();
    this.setState({ dialogIsOpen: false });
  }

  showDialog(e) {
    e.preventDefault();
    this.setState({ dialogIsOpen: true });
  }

  render() {
    const {
      callInProgress,
      errorMessage,
      forgottenDetailsHref,
      form: {
        fields: { mi },
      },
      onCancel,
      onContinue,
      onFieldChange,
    } = this.props;

    const { brand, translate } = this.context;

    const characters = mi.options;
    const positions = mi.challenge.map(({ pos }) => pos);
    let charsString = positions.pop();
    charsString = `${positions.join(', ')} and ${charsString}`;

    return (
      <Card>
        <CancelDialog
          isOpen={this.state.dialogIsOpen}
          onClose={e => this.hideDialog(e)}
          onLogOff={onCancel}
        />
        <form onSubmit={onContinue} noValidate="novalidate">
          <fieldset className="sca-mi__fieldset">
            {errorMessage && (
              <div className="sca-error-summary">
                <GenericNotification
                  heading={utilities.translateErrorCode(
                    brand,
                    errorMessage,
                    translate
                  )}
                  sentiment="negative"
                  testId="mi__page-error"
                />
              </div>
            )}

            <legend>
              <Paragraph variation="intro">
                {translate('mi.intro').replace('#charsString', charsString)}
              </Paragraph>
            </legend>

            {mi.error && (
              <div
                aria-live="polite"
                className="csl-field-error"
                data-csl-selector="field-error"
              >
                <span className="csl-field-error__icon-container">
                  <Icon name="negative" size="1.2rem" color="negative" />
                </span>
                <span className="csl-text--normal csl-text--color-error">
                  {utilities.translateErrorCode(brand, mi.error, translate)}
                </span>
              </div>
            )}

            <div className="sca-mi__columns">
              {mi.challenge.map(({ pos, name, value }) => (
                <div className="sca-mi__column" key={`selector-${pos}`}>
                  <Dropdown
                    label={`Character ${pos}`}
                    name={name}
                    supportiveText=""
                    onChange={onFieldChange}
                    value={value}
                    data-test-id="mi__select"
                  >
                    <Option value="">Select...</Option>
                    {characters.map(char => (
                      <Option
                        value={char}
                        key={`letter-${char}`}
                        data-test-id={`mi-select-${char}`}
                      >
                        {char}
                      </Option>
                    ))}
                  </Dropdown>
                </div>
              ))}
            </div>

            <Link
              data-test-id="mi_forgotten"
              external
              href={forgottenDetailsHref}
              variation="normal-emphasized"
            >
              {translate('mi.forgottenCta')}
            </Link>

            <LinksBar>
              <Link
                data-test-id="mi__cancel"
                href="#"
                onClick={e => this.showDialog(e)}
                variation="normal-emphasized"
              >
                {translate('mi.cancelCta')}
              </Link>
              <Button
                data-test-id="mi__continue"
                disabled={callInProgress}
                type="submit"
              >
                {translate('mi.continueCta')}
              </Button>
            </LinksBar>
          </fieldset>
        </form>
      </Card>
    );
  }
}

MI.contextTypes = {
  brand: PropTypes.oneOf(['bos', 'halifax', 'lloyds', 'mbna']),
  translate: PropTypes.func.isRequired,
};

MI.defaultProps = {
  callInProgress: false,
  errorMessage: '',
};

MI.propTypes = {
  /** Call in progress boolean, to notify if an asyncronous action is in progress */
  callInProgress: PropTypes.bool,
  /** A global error message for the page */
  errorMessage: PropTypes.string,
  /** The URL for the 'Forgotten your Memorable Information?' link */
  forgottenDetailsHref: PropTypes.string.isRequired,
  /** An object with the form elements */
  form: PropTypes.shape({
    /** A list of fields */
    fields: PropTypes.shape({
      mi: PropTypes.shape({
        /** A list of the challenge information objects (passed as an object as it is mobx)  */
        challenge: PropTypes.array.isRequired,
        /** The error message for the selects  */
        error: PropTypes.string,
        /** A list of all the possible MI values (passed as an object as it is mobx) */
        options: PropTypes.array.isRequired,
      }),
    }),
  }).isRequired,
  /** The cancel action for the page */
  onCancel: PropTypes.func.isRequired,
  /** The continue action for the page */
  onContinue: PropTypes.func.isRequired,
  /** The function to call when a dropdown value is selected */
  onFieldChange: PropTypes.func.isRequired,
};

export default MI;
