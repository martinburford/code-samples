// React imports
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router-dom';

// Redux imports
import { connect } from 'react-redux';

// SCA-UI imports
import {
  Connect,
  ContinueWithAppSign,
  ContinueWithToken,
  DeviceNotRegistered,
  EIAStep2,
  EIAFraud,
  EIAInvalidCode,
  EIANoAnswer,
  HavingTrouble,
  LoadingScreen,
  MI,
  PickNumber,
  SDID,
  SDIDNotTrusted,
  SDIDTrusted,
  SmsOtp,
  Token,
  UserIdPassword,
} from 'sca-ui/esm';

// Constellation imports
import { BOS, HALIFAX, LLOYDS, MBNA } from '@lbg/constellation';

// Local project imports (components)
import PageFrame from '../../../../components/PageFrame';
import Placeholder from '../../../../components/Placeholder';

// Local project imports (Redux)
import rootActionCreators from '../../../../store/action-creators/_root';
import miActionCreators from '../../../../store/action-creators/mi';
import pickNumberEIAActionCreators from '../../../../store/action-creators/pickNumberEIA';
import pickNumberSMSOTPActionCreators from '../../../../store/action-creators/pickNumberSMSOTP';
import SDIDActionCreators from '../../../../store/action-creators/SDID';
import smsOTPActionCreators from '../../../../store/action-creators/smsOTP';
import tokenActionCreators from '../../../../store/action-creators/token';
import userIdPasswordActionCreators from '../../../../store/action-creators/userIdPassword';

// Local project imports (other)
import constants from '../../../../constants/configuration';
import templateLiterals from '../../../../constants/template-literals';
import utilities from '../../../../helpers/utilities';

// Centralized PropTypes definitions
import PropTypeActions from '../../../../proptypes/actions/index';
import PropTypeState from '../../../../proptypes/state/index';

class WithAppSignSMSOTPEIASDIDV2EIAErrors extends Component {
  render() {
    const { brand, channel } = this.context;
    const { history } = this.props;

    // What is the base path of the current route?
    const basePath = utilities.getRouteInformation(
      { brand, channel },
      'logon',
      'september-2019-compliance',
      'with-token-appsign-smsotp-eia-sdid-(v2)-eia-errors'
    ).path;

    // Retrieve all required template literals
    const { UserIDIntro } = templateLiterals;

    return (
      <Fragment>
        {/* Homepage */}

        <Route
          exact
          path={basePath}
          render={() => (
            <PageFrame noStationary>
              <Placeholder
                image="homePage"
                action={() => history.push(`${basePath}/user-id`)}
              />
            </PageFrame>
          )}
        />

        {/* UserIdPassword */}

        <Route
          exact
          path={`${basePath}/user-id`}
          render={() => (
            <PageFrame
              heading="Welcome to Internet Banking"
              intro={UserIDIntro}
              sidebar="Style1"
            >
              <UserIdPassword
                callInProgress={this.props.redux.state.root.callInProgress}
                errorMessage={this.props.redux.state.root.errorMessage}
                forgotDetailsLink="#"
                forgottenAction={e => e.preventDefault()}
                form={this.props.redux.state.userIdPassword.form}
                onContinue={e => {
                  e.preventDefault();
                  history.push(`${basePath}/mi`);
                }}
                onPasswordChange={
                  this.props.redux.actions.userIdPassword.handlePasswordChange
                }
                onRememberMeChange={
                  this.props.redux.actions.userIdPassword.handleRememberMe
                }
                onUserIdChange={
                  this.props.redux.actions.userIdPassword.handleUserIdChange
                }
                rememberMe={this.props.redux.state.userIdPassword.rememberMe}
              />
            </PageFrame>
          )}
        />

        {/* Memorable information */}

        <Route
          exact
          path={`${basePath}/mi`}
          render={() => (
            <PageFrame
              heading="Memorable information"
              intro="Please enter your memorable information."
              sidebar="Style2"
            >
              <MI
                callInProgress={this.props.redux.state.mi.callInProgress}
                errorMessage={this.props.redux.state.mi.errorMessage}
                forgottenDetailsHref="#"
                form={this.props.redux.state.mi.form}
                onCancel={e => {
                  e.preventDefault();
                  history.push(`${basePath}/user-id`);
                }}
                onContinue={e => {
                  e.preventDefault();
                  history.push(`${basePath}/continue-with-token`);
                }}
                onFieldChange={this.props.redux.actions.mi.handleMIFieldChange}
              />
            </PageFrame>
          )}
        />

        {/* Continue with Token */}

        <Route
          exact
          path={`${basePath}/continue-with-token`}
          render={() => (
            <PageFrame
              heading="Verify yourself with your token"
              sidebar="Style2"
            >
              <ContinueWithToken
                fallback="appSign"
                onCancel={e => {
                  e.preventDefault();
                  history.push(`${basePath}/user-id`);
                }}
                onContinue={e => {
                  e.preventDefault();
                  history.push(`${basePath}/token`);
                }}
                onVerifyADifferentWay={e => {
                  e.preventDefault();
                  history.push(`${basePath}/continue-with-app-sign`);
                }}
              />
            </PageFrame>
          )}
        />

        {/* Token */}

        <Route
          exact
          path={`${basePath}/token`}
          render={() => (
            <PageFrame
              heading="Verify yourself with your token"
              sidebar="Style2"
            >
              <Token
                errorMessage={this.props.redux.state.token.errorMessage}
                form={this.props.redux.state.token.form}
                onContinue={e => {
                  e.preventDefault();
                  history.push(`${basePath}/sdid`);
                }}
                onHavingTrouble={e => {
                  e.preventDefault();
                  history.push(`${basePath}/having-trouble-token`);
                }}
                onPasscodeChange={
                  this.props.redux.actions.token.handlePasscodeChange
                }
              />
            </PageFrame>
          )}
        />

        {/* Having trouble (Token) */}

        <Route
          exact
          path={`${basePath}/having-trouble-token`}
          render={() => (
            <PageFrame heading="Having trouble?" sidebar="Style2">
              <HavingTrouble
                attemptsRemaining={3}
                fallback="appSign"
                onCancel={e => {
                  e.preventDefault();
                  history.push(`${basePath}/user-id`);
                }}
                onRetry={e => {
                  e.preventDefault();
                  history.push(`${basePath}/continue-with-token`);
                }}
                onVerifyADifferentWay={e => {
                  e.preventDefault();
                  history.push(`${basePath}/continue-with-app-sign`);
                }}
                type="token"
              />
            </PageFrame>
          )}
        />

        {/* Continue with AppSign */}

        <Route
          exact
          path={`${basePath}/continue-with-app-sign`}
          render={() => (
            <PageFrame heading="Verify yourself with the app" sidebar="Style2">
              <ContinueWithAppSign
                fallback="smsOtp"
                onCancel={e => {
                  e.preventDefault();
                  history.push(`${basePath}/user-id`);
                }}
                onContinue={e => {
                  e.preventDefault();
                  history.push(`${basePath}/check-your-device`);
                }}
                onVerifyADifferentWay={e => {
                  e.preventDefault();
                  history.push(`${basePath}/sms-selection`);
                }}
              />
            </PageFrame>
          )}
        />

        {/* Check your device */}

        <Route
          exact
          path={`${basePath}/check-your-device`}
          render={() => (
            <PageFrame heading="Verify yourself with the app" sidebar="Style2">
              <LoadingScreen
                appSign
                attemptsRemaining={3}
                isClickable
                noAppAction={() =>
                  history.push(`${basePath}/switch-authentication-sms`)
                }
                onContinue={e => {
                  e.preventDefault();
                  history.push(`${basePath}/sdid`);
                }}
                onHavingTrouble={e => {
                  e.preventDefault();
                  history.push(`${basePath}/having-trouble-app-sign`);
                }}
                progressImage="checkYourPhone"
              />
            </PageFrame>
          )}
        />

        {/* Having trouble (App Sign) */}

        <Route
          exact
          path={`${basePath}/having-trouble-app-sign`}
          render={() => (
            <PageFrame heading="Having trouble?" sidebar="Style2">
              <HavingTrouble
                attemptsRemaining={3}
                fallback="smsOtp"
                onCancel={e => {
                  e.preventDefault();
                  history.push(`${basePath}/user-id`);
                }}
                onRetry={e => {
                  e.preventDefault();
                  history.push(`${basePath}/check-your-device`);
                }}
                onVerifyADifferentWay={e => {
                  e.preventDefault();
                  history.push(`${basePath}/sms-selection`);
                }}
                type="appSign"
              />
            </PageFrame>
          )}
        />

        {/* SMS selection */}

        <Route
          exact
          path={`${basePath}/sms-selection`}
          render={() => (
            <PageFrame
              heading="Verify yourself with a passcode"
              sidebar="Style2"
            >
              <PickNumber
                attemptsRemaining={2}
                errorMessage={
                  this.props.redux.state.pickNumberSMSOTP.errorMessage
                }
                fallback="eia"
                form={this.props.redux.state.pickNumberSMSOTP.form}
                numberType="sms"
                onCancel={e => {
                  e.preventDefault();
                  history.push(`${basePath}/user-id`);
                }}
                onContinue={e => {
                  e.preventDefault();
                  history.push(`${basePath}/sms-otp`);
                }}
                onFieldChange={e => {
                  // Keep the event alive since it's a synthetic React event
                  e.persist();

                  this.props.redux.actions.pickNumberSMSOTP.handleContactNumberChange(
                    e
                  );
                }}
                onVerifyADifferentWay={e => {
                  e.preventDefault();
                  history.push(`${basePath}/eia-selection`);
                }}
              />
            </PageFrame>
          )}
        />

        {/* SMSOTP */}

        <Route
          exact
          path={`${basePath}/sms-otp`}
          render={() => (
            <PageFrame
              heading="Verify yourself with a passcode"
              sidebar="Style2"
            >
              <SmsOtp
                chooseADifferentNumberHref={`${basePath}/sms-selection`}
                errorMessage={this.props.redux.state.smsOTP.errorMessage}
                form={this.props.redux.state.smsOTP.form}
                newCodeAction={e => e.preventDefault()}
                onContinue={e => {
                  e.preventDefault();
                  history.push(`${basePath}/sdid`);
                }}
                onHavingTrouble={e => {
                  e.preventDefault();
                  history.push(`${basePath}/having-trouble-sms-otp`);
                }}
                onPasscodeChange={
                  this.props.redux.actions.smsOTP.handlePasscodeChange
                }
              />
            </PageFrame>
          )}
        />

        {/* Having trouble (SMS OTP) */}

        <Route
          exact
          path={`${basePath}/having-trouble-sms-otp`}
          render={() => (
            <PageFrame heading="Having trouble?" sidebar="Style2">
              <HavingTrouble
                attemptsRemaining={2}
                fallback="eia"
                onCancel={e => {
                  e.preventDefault();
                  history.push(`${basePath}/user-id`);
                }}
                onRetry={e => {
                  e.preventDefault();
                  history.push(`${basePath}/sms-selection`);
                }}
                onVerifyADifferentWay={e => {
                  e.preventDefault();
                  history.push(`${basePath}/eia-selection`);
                }}
                type="smsOtp"
              />
            </PageFrame>
          )}
        />

        {/* EIA selection */}

        <Route
          exact
          path={`${basePath}/eia-selection`}
          render={() => (
            <PageFrame
              heading="Verify yourself with a phone call"
              sidebar="Style2"
            >
              <PickNumber
                attemptsRemaining={1}
                debugOptions={[
                  {
                    click: e => {
                      e.preventDefault();
                      history.push(`${basePath}/eia-fraud`);
                    },
                    label: 'EIA fraud',
                  },
                  {
                    click: e => {
                      e.preventDefault();
                      history.push(`${basePath}/eia-invalid-code`);
                    },
                    label: 'EIA invalid code',
                  },
                  {
                    click: e => {
                      e.preventDefault();
                      history.push(`${basePath}/eia-no-answer`);
                    },
                    label: 'EIA no answer',
                  },
                ]}
                errorMessage={this.props.redux.state.pickNumberEIA.errorMessage}
                form={this.props.redux.state.pickNumberEIA.form}
                numberType="eia"
                onCancel={e => {
                  e.preventDefault();
                  history.push(`${basePath}/user-id`);
                }}
                onContinue={e => {
                  e.preventDefault();
                  history.push(`${basePath}/eia`);
                }}
                onFieldChange={e => {
                  // Keep the event alive since it's a synthetic React event
                  e.persist();

                  this.props.redux.actions.pickNumberEIA.handleContactNumberChange(
                    e
                  );
                }}
                onVerifyADifferentWay={e => {
                  e.preventDefault();
                  history.push(`${basePath}/connect`);
                }}
                showDebugOptions
              />
            </PageFrame>
          )}
        />

        {/* EIA */}

        <Route
          exact
          path={`${basePath}/eia`}
          render={() => (
            <PageFrame
              heading="Verify yourself with a phone call"
              sidebar="Style2"
            >
              <EIAStep2
                attemptsRemaining={1}
                clickableSpinner
                numberEnding={678}
                onContinue={e => {
                  e.preventDefault();
                  history.push(`${basePath}/sdid`);
                }}
                onCancel={e => {
                  e.preventDefault();
                  history.push(`${basePath}/user-id`);
                }}
                passcode="8234"
              />
            </PageFrame>
          )}
        />

        {/* Having trouble (EIA) */}

        <Route
          exact
          path={`${basePath}/having-trouble-eia`}
          render={() => (
            <PageFrame heading="Having trouble?" sidebar="Style2">
              <HavingTrouble
                attemptsRemaining={1}
                onCancel={e => {
                  e.preventDefault();
                  history.push(`${basePath}/user-id`);
                }}
                onRetry={e => {
                  e.preventDefault();
                  history.push(`${basePath}/eia-selection`);
                }}
                onVerifyADifferentWay={e => {
                  e.preventDefault();
                  history.push(`${basePath}/connect`);
                }}
                type="eia"
              />
            </PageFrame>
          )}
        />

        {/* EIA Fraud */}

        <Route
          exact
          path={`${basePath}/eia-fraud`}
          render={() => (
            <PageFrame heading="We couldn't verify you" sidebar="Style2">
              <EIAFraud
                onBackToBankHomepage={() => {
                  history.push(`${basePath}/user-id`);
                }}
              />
            </PageFrame>
          )}
        />

        {/* EIA Invalid Code */}

        <Route
          exact
          path={`${basePath}/eia-invalid-code`}
          render={() => (
            <PageFrame heading="We couldn't verify you" sidebar="Style2">
              <EIAInvalidCode
                onBackToBankHomepage={() => {
                  history.push(`${basePath}/user-id`);
                }}
                onRetry={() => {
                  history.push(`${basePath}/eia-selection`);
                }}
              />
            </PageFrame>
          )}
        />

        {/* EIA No Answer */}

        <Route
          exact
          path={`${basePath}/eia-no-answer`}
          render={() => (
            <PageFrame heading="We couldn't verify you" sidebar="Style2">
              <EIANoAnswer
                onBackToBankHomepage={() => {
                  history.push(`${basePath}/user-id`);
                }}
                onRetry={() => {
                  history.push(`${basePath}/eia-selection`);
                }}
                phoneNumber="012 **** 7890"
              />
            </PageFrame>
          )}
        />

        {/* Connect */}

        <Route
          exact
          path={`${basePath}/connect`}
          render={() => (
            <PageFrame
              heading="Please call us to verify yourself"
              sidebar="Style2"
            >
              <Connect
                onBackToHomepage={e => {
                  e.preventDefault();
                  history.push(basePath);
                }}
              />
            </PageFrame>
          )}
        />

        {/* SDID */}

        <Route
          exact
          path={`${basePath}/sdid`}
          render={() => {
            let submitUrlSuffix;

            switch (this.props.redux.state.SDID.trustType) {
              case 'Trust this device':
                submitUrlSuffix = 'sdid-trusted';
                break;
              case 'Do not trust this device':
                submitUrlSuffix = 'sdid-not-trusted';
                break;
              case 'Device not registered':
                submitUrlSuffix = 'device-not-registered';
                break;
            }

            return (
              <PageFrame heading="Success" sidebar="Style2">
                <SDID
                  form={this.props.redux.state.SDID.form}
                  onCheckboxChange={e => {
                    // Keep the event alive since it's a synthetic React event
                    e.persist();

                    this.props.redux.actions.SDID.handleCheckboxChange(e);
                  }}
                  onContinue={e => {
                    e.preventDefault();
                    history.push(`${basePath}/${submitUrlSuffix}`);
                  }}
                />
              </PageFrame>
            );
          }}
        />

        {/* SDID (trusted) */}

        <Route
          exact
          path={`${basePath}/sdid-trusted`}
          render={() => (
            <PageFrame heading="This device is now trusted" sidebar="Style2">
              <SDIDTrusted
                onContinue={e => {
                  e.preventDefault();
                  history.push(`${basePath}/account-overview`);
                }}
              />
            </PageFrame>
          )}
        />

        {/* SDID (not trusted) */}

        <Route
          exact
          path={`${basePath}/sdid-not-trusted`}
          render={() => (
            <PageFrame
              heading="This device has not been trusted"
              sidebar="Style2"
            >
              <SDIDNotTrusted
                onContinue={e => {
                  e.preventDefault();
                  history.push(`${basePath}/account-overview`);
                }}
              />
            </PageFrame>
          )}
        />

        {/* SDID (device not registered) */}

        <Route
          exact
          path={`${basePath}/device-not-registered`}
          render={() => (
            <PageFrame
              heading="This device has not been trusted"
              sidebar="Style2"
            >
              <DeviceNotRegistered
                onContinue={e => {
                  e.preventDefault();
                  history.push(`${basePath}/account-overview`);
                }}
              />
            </PageFrame>
          )}
        />

        {/* Account overview */}

        <Route
          exact
          path={`${basePath}/account-overview`}
          render={() => (
            <PageFrame noStationary>
              <Placeholder
                image="accountOverview"
                action={() => history.push('/')}
                isLastScreen
              />
            </PageFrame>
          )}
        />
      </Fragment>
    );
  }
}

// Map Redux state to component props
const mapStateToProps = state => ({
  root: {
    ...state.rootReducer,
  },
  mi: {
    ...state.miReducer,
  },
  pickNumberEIA: {
    ...state.pickNumberEIAReducer,
  },
  pickNumberSMSOTP: {
    ...state.pickNumberSMSOTPReducer,
  },
  SDID: {
    ...state.SDIDReducer,
  },
  smsOTP: {
    ...state.smsOTPReducer,
  },
  token: {
    ...state.tokenReducer,
  },
  userIdPassword: {
    ...state.userIdPasswordReducer,
  },
});

// Map Redux dispatch to component props
const mapDispatchToProps = dispatch => ({
  // Pass in the action creators for the different parts of the page (root + components)
  ...rootActionCreators(dispatch),
  ...miActionCreators(dispatch),
  ...pickNumberEIAActionCreators(dispatch),
  ...pickNumberSMSOTPActionCreators(dispatch),
  ...SDIDActionCreators(dispatch),
  ...smsOTPActionCreators(dispatch),
  ...tokenActionCreators(dispatch),
  ...userIdPasswordActionCreators(dispatch),
});

// Since the mapStateToProps and mapDispatchToProps props values existing at the same nesting structure, merge the 2 sets of props so that none are mutated
const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  redux: {
    state: stateProps,
    actions: dispatchProps,
  },
});

WithAppSignSMSOTPEIASDIDV2EIAErrors.contextTypes = {
  brand: PropTypes.oneOf([LLOYDS, HALIFAX, BOS, MBNA]),
  channel: PropTypes.oneOf(constants.channels).isRequired,
};

WithAppSignSMSOTPEIASDIDV2EIAErrors.propTypes = {
  redux: PropTypes.shape({
    actions: PropTypes.shape({
      root: PropTypeActions.root,
      mi: PropTypeActions.mi,
      pickNumberEIA: PropTypeActions.pickNumberEIA,
      pickNumberSMSOTP: PropTypeActions.pickNumberSMSOTP,
      SDID: PropTypeActions.SDID,
      smsOTP: PropTypeActions.smsOTP,
      token: PropTypeActions.token,
      userIdPassword: PropTypeActions.userIdPassword,
    }).isRequired,
    state: PropTypes.shape({
      root: PropTypeState.root,
      mi: PropTypeState.mi,
      pickNumberEIA: PropTypeState.pickNumberEIA,
      pickNumberSMSOTP: PropTypeState.pickNumberSMSOTP,
      SDID: PropTypeState.SDID,
      smsOTP: PropTypeState.smsOTP,
      token: PropTypeState.token,
      userIdPassword: PropTypeState.userIDPassword,
    }),
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(WithAppSignSMSOTPEIASDIDV2EIAErrors)
);
