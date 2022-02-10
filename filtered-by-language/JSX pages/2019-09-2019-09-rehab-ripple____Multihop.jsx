import React, { Component, Fragment } from 'react';
import { connect } from "react-redux";

import ApiScreen from '../../components/api-screen';
import DeviceApiScreen from '../../components/device-api-screen';
import DeviceInfoScreen from '../../components/device-info-screen';
import InfoScreen from '../../components/info-screen';
import LedgerInfoScreen from '../../components/ledger-info-screen';

// Redux
import { updateSiteHeading } from "../../redux/site/actions";

// Key replacement
import KeyReplacement from '../../components/key-replacement/';

// Flows
import Flow1Svg from "./Flow1Svg";
import Flow2Svg from "./Flow2Svg";
import Flow3Svg from "./Flow3Svg";

import TickImage from '../../assets/images/tick.png';

// Countries
import countryFlags from '../../data/country-flags';

class Multihop extends Component {
    componentDidMount(){
        // Re-direct back to the setup screen whenever a deep-link URL is accessed within Redux being populated from the setup screen
        if(Object.keys(this.props.redux.state.demo).length === 0){
            this.props.history.push('/');
        }

        // Update the Site heading to reflect 'MULTIHOP'
        this.props.redux.actions.site.updateSiteHeading({SITE_HEADING: 'MULTIHOP'});
    }

    render(){
        const { currentStep, flowSteps, slug } = this.props.redux.state.flow; 

        // Navigation Urls for the breadcrumb
        const previousStep = currentStep === 1 ? '/main-menu' : `/flows/${slug}/step/${currentStep-1}`;
        const nextStep = flowSteps >= currentStep+1 ? `/flows/${slug}/step/${currentStep+1}` : null;
        let pageElem = null;

        const commonProps = {
            activeStep: currentStep,
            nextStep: nextStep,
            previousStep: previousStep,
            svgContext: [
                {
                    style: {
                        top: '10px',
                        left:'179px'
                    },
                    render: `Sender`
                },
                {
                    style: {
                        top: '33px',
                        left: '108px',
                        width: '180px'
                    },
                    class: 'institution-title',
                    render: (
                        <Fragment>
                            <img 
                                src={countryFlags[(this.props.redux.state.demo.SENDER_FLAG || '').replace(/-/g,'')]} 
                                alt="Flag" 
                            />
                            <KeyReplacement content="[DEMO:SENDER_NAME]" />
                        </Fragment>
                    )
                },
                {
                    style: {
                        top: '10px',
                        left: '362px'
                    },
                    render: `Intermediary`
                },
                {
                    style: {
                        top: '33px',
                        left: '312px',
                        width: '180px'
                    },
                    class: 'institution-title',
                    render: (
                        <Fragment>
                            <img 
                                src={countryFlags[(this.props.redux.state.demo.INTERMEDIARY_FLAG || '').replace(/-/g,'')]} 
                                alt="Flag" 
                            />
                            <KeyReplacement content="[DEMO:INTERMEDIARY_NAME]" />
                        </Fragment>
                    )
                },
                {
                    style: {
                        top: '10px',
                        right:'176px'
                    },
                    render: 'Receiver'
                },
                {
                    style: {
                        top: '33px',
                        right: '112px',
                        width: '180px'
                    },
                    class: 'institution-title',
                    render: (
                        <Fragment>
                            <img
                                src={countryFlags[(this.props.redux.state.demo.RECEIVER_FLAG || '').replace(/-/g,'')]}
                                alt="Flag"
                            />
                            <KeyReplacement content="[DEMO:RECEIVER_NAME]" />
                        </Fragment>
                    )
                },
            ]
        }

        switch(currentStep){
            case 1: 
                pageElem = (
                    <DeviceInfoScreen
                        {...commonProps}
                        copy={<KeyReplacement content="[DEMO:SENDER_NAME]’s customer opens their mobile app and selects who they want to send money to, and how much they want to send." />}
                        device="input_sender"
                        svg={Flow1Svg}
                    />
                );

                break;
            
            case 2:
                pageElem = (
                    <DeviceInfoScreen
                        {...commonProps}
                        copy={<KeyReplacement content="[DEMO:SENDER_NAME]’s customer opens their mobile app and selects who they want to send money to, and how much they want to send." />}
                        device="input_receiver"
                        svg={Flow1Svg}
                    />
                );

                break;

            case 3:
                pageElem = (
                    <DeviceInfoScreen
                        {...commonProps}
                        copy={<KeyReplacement content="[DEMO:SENDER_NAME]’s customer opens their mobile app and selects who they want to send money to, and how much they want to send." />}
                        device="summary"
                        svg={Flow1Svg}
                    />
                );
    
                break;

            case 4:
                pageElem = (
                    <DeviceInfoScreen
                        {...commonProps}
                        copy={<KeyReplacement content="[DEMO:SENDER_NAME]'s customer accepts the request to pay." />}
                        device="summary"
                        slug={slug}
                        svg={Flow1Svg}
                        svgContext={[
                            ...commonProps.svgContext,
                            ...[{
                                style: {
                                    top: '85px',
                                    left: '60px'
                                },
                                copy: `<img alt="Tick" src="${TickImage}" /> Validation <br/>
                                    <img alt="Tick" src="${TickImage}" /> Screening`
                            }]
                        ]}
                    />
                );
    
                break;

            case 5:
                pageElem = (
                    <DeviceApiScreen
                        {...commonProps}
                        copy={<KeyReplacement content="[DEMO:SENDER_NAME] requests a quote from all parties in the transaction." />}
                        device="summary"
                        heading="Request Quote"
                        slug={slug}
                        svg={Flow1Svg}
                    />
                );
    
                break;

            case 6:
                pageElem = (
                    <DeviceInfoScreen
                        {...commonProps}
                        copy={<KeyReplacement content="[DEMO:SENDER_NAME]'s customer sees a full breakdown of the fees and decides to send the payment." />}
                        device="send"
                        heading="Request Quote"
                        svg={Flow1Svg}
                    />
                );
    
                break;

            case 7:
                pageElem = (
                    <ApiScreen
                        {...commonProps}
                        copy={<KeyReplacement content="[DEMO:SENDER_NAME] sends the payment information to [DEMO:INTERMEDIARY_NAME] and [DEMO:RECEIVER_NAME]" />}
                        device="send"
                        heading="Accept Quote"
                        slug={slug}
                        svg={{
                            front: Flow1Svg,
                            back: Flow2Svg
                        }}
                        svgContext={{
                            front: commonProps.svgContext,
                            back: [
                                ...commonProps.svgContext,
                                ...[{
                                    style: {
                                        top: '85px',
                                        right: '60px'
                                    },
                                    copy: `<img alt="Tick" src="${TickImage}" /> Validation <br/>
                                        <img alt="Tick" src="${TickImage}" /> Screening`
                                }]
                            ]
                        }}
                    />
                );
    
                break;

            case 8:
                pageElem = (
                    <ApiScreen
                        {...commonProps}
                        copy={<KeyReplacement content="The terms of the payment are locked." />}
                        heading="Lock Payment"
                        slug={slug}
                        svg={Flow1Svg}
                    />
                );
    
                break;

            case 9:
                pageElem = (
                    <ApiScreen
                        {...commonProps}
                        copy={<KeyReplacement content="[DEMO:SENDER_NAME] initiates the payment." />}
                        heading="Settle Payment"
                        slug={slug}
                        svg={Flow1Svg}
                    />
                );
    
                break;

            case 10:
                pageElem = (
                    <LedgerInfoScreen
                        {...commonProps}
                        heading="Settle Payment"
                        slug={slug}
                        svg={Flow1Svg}
                        svgContext={[
                            ...commonProps.svgContext,
                            ...[
                                {
                                    style: {
                                        top: '310px',
                                        left: '25px'
                                    },
                                    copy: `<img alt="Tick" src="${TickImage}" /> Ledger Updates`
                                },
                                {
                                    style: {
                                        top: '350px',
                                        left: '330px'
                                    },
                                    copy: `<img alt="Tick" src="${TickImage}" /> Ledger Updates`
                                },
                                {
                                    style: {
                                        top: '310px',
                                        right: '25px'
                                    },
                                    copy: `<img alt="Tick" src="${TickImage}" /> Ledger Updates`
                                }
                            ]
                        ]}
                    />
                );
    
                break;

            case 11:
                pageElem = (
                    <InfoScreen
                        {...commonProps}
                        copy="Ripple's validator confirms both parties are abiding by the terms of the transaction."
                        heading="Settle Payment"
                        svg={Flow1Svg}
                    />
                );
    
                break;

            case 12:
                pageElem = (
                    <LedgerInfoScreen
                        {...commonProps}
                        heading="Settle Payment"
                        slug={slug}
                        svg={Flow1Svg}
                        svgContext={[
                            ...commonProps.svgContext,
                            ...[
                                {
                                    style: {
                                        top: '310px',
                                        left: '25px'
                                    },
                                    copy: `<img alt="Tick" src="${TickImage}" /> Ledger Updates`
                                },
                                {
                                    style: {
                                        top: '350px',
                                        left: '330px'
                                    },
                                    copy: `<img alt="Tick" src="${TickImage}" /> Ledger Updates`
                                },
                                {
                                    style: {
                                        top: '310px',
                                        right: '25px'
                                    },
                                    copy: `<img alt="Tick" src="${TickImage}" /> Ledger Updates`
                                }
                            ]
                        ]}
                    />
                );
    
                break;

            case 13:
                pageElem = (
                    <InfoScreen
                        {...commonProps}
                        copy={<KeyReplacement content="[DEMO:SENDER_NAME], [DEMO:INTERMEDIARY_NAME] and [DEMO:RECEIVER_NAME] are notified that their ledgers have updated." />}
                        heading="Settle Payment"
                        svg={Flow1Svg}
                    />
                );
    
                break;

            case 14:
                commonProps.svgContext[0].style.left = '178px';
                commonProps.svgContext[1].style.left = '126px';
                commonProps.svgContext[1].style.width = '150px';

                commonProps.svgContext[2].style.left = '320px';
                commonProps.svgContext[3].style.left = '280px';
                commonProps.svgContext[3].style.width = '150px';

                commonProps.svgContext[4].style.right = '263px';
                commonProps.svgContext[5].style.width = '150px';
                commonProps.svgContext[5].style.right = '212px';

                pageElem = (
                    <ApiScreen
                        {...commonProps}
                        copy={<KeyReplacement content="[DEMO:RECEIVER_NAME] completes last mile payout if necessary." />}
                        heading="Settle Payment"
                        slug={slug}
                        svg={Flow3Svg}
                    />
                );
    
                break;

            case 15:
                commonProps.svgContext[0].style.left = '178px';
                commonProps.svgContext[1].style.left = '126px';
                commonProps.svgContext[1].style.width = '150px';

                commonProps.svgContext[2].style.left = '320px';
                commonProps.svgContext[3].style.left = '280px';
                commonProps.svgContext[3].style.width = '150px';

                commonProps.svgContext[4].style.right = '263px';
                commonProps.svgContext[5].style.width = '150px';
                commonProps.svgContext[5].style.right = '212px';
                
                pageElem = (
                    <DeviceInfoScreen
                        {...commonProps}
                        copy={<KeyReplacement content="[DEMO:SENDER_NAME] and their customer are notified that the payment has been delivered." />}
                        heading="Payment Complete"
                        device="success"
                        svg={Flow3Svg}
                    />
                );
    
                break;

            default:
                break;
        }

        return pageElem;
    }
};

// Map Redux state to component props
const mapStateToProps = state => ({
    demo: {
        ...state.demoReducer
    },
    flow: {
        ...state.flowReducer
    },
    site: {
        ...state.siteReducer
    }
});

// Map Redux dispatch to component props
const mapDispatchToProps = dispatch => ({
    site: {
        updateSiteHeading: heading => dispatch(updateSiteHeading(heading))
    }
});

// Since the mapStateToProps and mapDispatchToProps props values existing at the same nesting structure, merge the 2 sets of props so that none are mutated
const mergeProps = (stateProps, dispatchProps, ownProps) => ({
    ...ownProps,
    redux: {
        actions: dispatchProps,
        state: stateProps
    },
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
)(Multihop);