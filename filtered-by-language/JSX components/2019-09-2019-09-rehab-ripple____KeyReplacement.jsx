import React, { Fragment } from "react";
import { connect } from "react-redux";

import reactStringReplace from 'react-string-replace';
import uuidv1 from 'uuid/v1';

/**
 * Take an input key ([DEMO: SENDER_NAME]) and convert it using the first fragmenet as the identifier of the Redux state object to access and the second fragement being the property name
 * @param {string} content - The string of text which potentially (but not necessarily) includes keys to replace
 * @param {boolean} debug - Whether or not to show the Redux key alongside the retrieved value from Redux
 * @param {string} formatType - 'capitalize' || 'leading-capitalize' || 'sender-name-initialize'
 * @param {*} redux - The exposed Redux data via connecting to the store
 * @returns {string} - The input string but with any keys needing to be replaced having been replaced with values from Redux
 */
const KeyReplacement = ({ content, debug=false, format=null, redux }) => {
    /**
     * Format a keys textual value in a specific custom format
     * @param {string} formatType - 'capitalize' || 'leading-capitalize' || 'sender-name-initialize'
     * @param {string} text - The keys textual value from Redux
     * @returns {string} - The Redux string in the desired format
     */
    const formatText = (formatType, text) => {
        switch(formatType){
            case 'capitalize':
                return text.toUpperCase();
            case 'leading-capitalize':
                return text.split('-').map(str => {
                    return `${str.substr(0,1).toUpperCase()}${str.substr(1,str.length-1)}`;
                }).join(' ');
            case 'sender-name-initialize':
                return text.split(' ').map((str, index) => {
                    return index <= 1 ? str.substr(0,1).toUpperCase() : null;
                });
            default:
                return text;
        }
    }

    /**
     * Perform the CONVERTED_AMOUNT calculation and return the result
     * @function getConvertedAmount
     * @returns {number} - The result of the calculation
     */
    const getConvertedAmount = () => {
        const RECEIVER_AMOUNT = parseInt(redux.state['calculators']['RECEIVER']);
        const RECEIVER_FEE = parseFloat(redux.state['demo']['RECEIVER_FEE']);
        const FXRATE = parseFloat(redux.state['rates']['FXRATE']);

        return ((RECEIVER_AMOUNT + RECEIVER_FEE) / FXRATE).toFixed(2);
    }

    /**
     * Perform the CONVERTED_AMOUNT_CRYPTO_FROM calculation and return the result
     * @function getConvertedAmountCryptoFrom
     * @returns {number} - The result of the calculation
     */
    const getConvertedAmountCryptoFrom = () => {
        const RECEIVER_AMOUNT = parseInt(redux.state['calculators']['RECEIVER']);
        const RECEIVER_FEE = parseFloat(redux.state['demo']['RECEIVER_FEE']);
        const CRYPTOFROMRATE = parseFloat(redux.state['rates']['CRYPTOFROMRATE']);

        return ((RECEIVER_AMOUNT + RECEIVER_FEE) * CRYPTOFROMRATE).toFixed(2);
    }

    /**
     * Perform the CONVERTED_AMOUNT_CRYPTO_TO calculation and return the result
     * @function getConvertedAmountCryptoFrom
     * @returns {number} - The result of the calculation
     */
    const getConvertedAmountCryptoTo = () => {
        const RECEIVER_AMOUNT = parseInt(redux.state['calculators']['RECEIVER']);
        const RECEIVER_FEE = parseFloat(redux.state['demo']['RECEIVER_FEE']);
        const CRYPTOTORATE = parseFloat(redux.state['rates']['CRYPTOTORATE']);

        return ((RECEIVER_AMOUNT + RECEIVER_FEE) / CRYPTOTORATE).toFixed(2);
    }

    /**
     * Perform the CALCULATOR_RECEIVER_PLUS_RECEIVER_FEE calculation and return the result
     * @function getCalculatorReceiverPlusReceiverFee
     * @returns {number} - The result of the calculation
     */
    const getCalculatorReceiverPlusReceiverFee = () => {
        const RECEIVER_AMOUNT = parseInt(redux.state['calculators']['RECEIVER']);
        const RECEIVER_FEE = parseFloat(redux.state['demo']['RECEIVER_FEE']);

        return (RECEIVER_AMOUNT + RECEIVER_FEE).toFixed(2);
    }

    /**
     * Perform the CONVERTED_AMOUNT_MINUS_SENDER_FEE calculation and return the result
     * @function getConvertedAmountPlusSenderFee
     * @returns {number} - The result of the calculation
     */
    const getConvertedAmountMinusSenderFee = () => {
        const CONVERTED_AMOUNT = parseFloat(getConvertedAmount());
        const SENDER_FEE = parseFloat(redux.state['demo']['SENDER_FEE']);

        return (CONVERTED_AMOUNT - SENDER_FEE).toFixed(2);
    }

    /**
     * Perform the CONVERTED_AMOUNT_PLUS_SENDER_FEE calculation and return the result
     * @function getConvertedAmountPlusSenderFee
     * @returns {number} - The result of the calculation
     */
    const getConvertedAmountPlusSenderFee = () => {
        const CONVERTED_AMOUNT = parseFloat(getConvertedAmount());
        const SENDER_FEE = parseFloat(redux.state['demo']['SENDER_FEE']);

        return (CONVERTED_AMOUNT + SENDER_FEE).toFixed(2);
    }

    /**
     * Perform the RECEIVER_PLUS_INTERMEDIARY_FEE_RECEIVING_PLUS_RECEIVER_FEE calculation and return the result
     * @function getCalculatorReceiverPlusIntermediaryFeeReceivingPlusReceivingFee
     * @returns {number} - The result of the calculation
     */
    const getCalculatorReceiverPlusIntermediaryFeeReceivingPlusReceivingFee = () => {
        const RECEIVER_AMOUNT = parseInt(redux.state['calculators']['RECEIVER']);
        const INTERMEDIARY_FEE_RECEIVING = parseFloat(redux.state['demo']['INTERMEDIARY_FEE_RECEIVING']);
        const RECEIVER_FEE = parseFloat(redux.state['demo']['RECEIVER_FEE']);

        return (RECEIVER_AMOUNT + INTERMEDIARY_FEE_RECEIVING + RECEIVER_FEE).toFixed(2);
    }

    const output = reactStringReplace(content, /\[(.*?)\]/gm, (match, i) => {
        // Handle JSON values which are an empty array
        if(match.length === 0){
            return '[]';
        }

        // Nested JSON will not return a parsable pattern, in this case return the child nodes
        if(match.substring(0,4) !== 'DEMO' && match.substring(0,5) !== 'RATES' && match.substring(0,11) !== 'CALCULATORS' && match.substring(0,11) !== 'CALCULATION' && match !== 'CURRENT_DATE'){
            return `[${match}]`;
        }

        // Handle JSON values which specific the current date should be returned
        if(match === 'CURRENT_DATE'){
            const currentDate = new Date();
            var dd = String(currentDate.getDate()).padStart(2, '0');
            var mm = String(currentDate.getMonth() + 1).padStart(2, '0');
            var yyyy = currentDate.getFullYear();

            if(debug){
                return (
                    <Fragment key={uuidv1()}>
                        <span key={`original-CURRENT_DATE-${uuidv1()}`} style={{color: 'green'}}>[{match}]</span>
                        <span key={`converted-CURRENT_DATE-${uuidv1()}`} style={{color: 'red'}}>=>({`${yyyy}-${mm}-${dd}`})</span>
                    </Fragment>
                )
            } else {
                return <span key={`converted-CURRENT_DATE-${uuidv1()}`}>{`${yyyy}-${mm}-${dd}`}</span>
            }
        }

        const stateType = match.split(':')[0].toLowerCase();
        const keyFragment = match.split(':')[1];
        let keyReplacementText;

        // Does a custom calculation need to be performed?
        if(stateType === 'calculation'){
            switch(keyFragment){
                case 'CONVERTED_AMOUNT_CRYPTO_FROM':
                    keyReplacementText = getConvertedAmountCryptoFrom();
                    break;
                case 'CONVERTED_AMOUNT_CRYPTO_TO':
                    keyReplacementText = getConvertedAmountCryptoTo();
                    break;
                case 'CONVERTED_AMOUNT':
                    keyReplacementText = getConvertedAmount();
                    break;
                case 'CALCULATOR_RECEIVER_PLUS_RECEIVER_FEE':
                    keyReplacementText = getCalculatorReceiverPlusReceiverFee();
                    break;
                case 'CONVERTED_AMOUNT_MINUS_SENDER_FEE':
                    keyReplacementText = getConvertedAmountMinusSenderFee();
                    break;
                case 'CONVERTED_AMOUNT_PLUS_SENDER_FEE':
                    keyReplacementText = getConvertedAmountPlusSenderFee();
                    break;
                case 'CALCULATOR_RECEIVER_PLUS_INTERMEDIARY_FEE_RECEIVING_PLUS_RECEIVER_FEE':
                    keyReplacementText = getCalculatorReceiverPlusIntermediaryFeeReceivingPlusReceivingFee();
                    break;
                default:
                    break;
            }
        } else {
            keyReplacementText = redux.state[stateType][keyFragment];
        }

        let converted;
        if(debug){
            converted = (
                <Fragment key={uuidv1()}>
                    {format !== 'sender-name-initialize' && (
                        <span key={`original-${keyFragment}-${uuidv1()}`} style={{color: 'green'}}>[{stateType.toUpperCase()}:{keyFragment}]=></span>
                    )}
                    <span key={`converted-${keyFragment}-${uuidv1()}`} style={{color: 'red'}} title={`[${stateType}]:${keyFragment}`}>({formatText(format, keyReplacementText)})</span>
                </Fragment>
            )
        } else {
            converted = <span key={`converted-${keyFragment}`} title={`[${stateType}]:${keyFragment}`}>{formatText(format, keyReplacementText)}</span>
        }

        return converted;
    });

    return output;
};

// Map Redux state to component props
const mapStateToProps = state => ({
    calculators: {
        ...state.calculatorsReducer
    },
    demo: {
        ...state.demoReducer
    },
    rates: {
        ...state.ratesReducer
    }
});

// Since the mapStateToProps and mapDispatchToProps props values existing at the same nesting structure, merge the 2 sets of props so that none are mutated
const mergeProps = (stateProps, dispatchProps, ownProps) => ({
    ...ownProps,
    redux: {
        state: stateProps,
        actions: dispatchProps,
    },
});

export default(
    connect(
        mapStateToProps,
        null,
        mergeProps
    )(KeyReplacement)
);