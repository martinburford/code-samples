import React, { Fragment } from "react";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";

import classNames from "classnames";

// Unique UIDs
import uuidv1 from 'uuid/v1';

import styles from "./FlowLedger.module.scss";

const configuration = {
    flows: {
        'bilateral-settlement': {
            coreLedgers: {
                sender: {
                    transactional: 'BS-CORE-SEND-TRANSACTIONAL',
                    hold: 'BS-CORE-SEND-HOLD',
                    treasury: 'BS-CORE-SEND-TREASURY'
                },
                receiver: {
                    transactional: 'BS-CORE-RECEIVE-TRANSACTIONAL',
                    hold: 'BS-CORE-RECEIVE-HOLD',
                    'senders-nostro': 'BS-CORE-SENDERS-NOSTRO'
                }
            },
            subLedgers: {
                sender: {
                    transactional: 'BS-SUB-SEND-TRANSACTIONAL',
                    hold: 'BS-SUB-SEND-HOLD',
                    treasury: 'BS-SUB-SEND-TREASURY'
                },
                receiver: {
                    transactional: 'BS-SUB-RECEIVE-TRANSACTIONAL',
                    hold: 'BS-SUB-RECEIVE-HOLD',
                    'senders-nostro': 'BS-SUB-SENDERS-NOSTRO'
                }
            }
        },
        multihop: {
            coreLedgers: {
                sender: {
                    transactional: 'MH-CORE-SEND-TRANSACTIONAL',
                    hold: 'MH-CORE-SEND-HOLD',
                    treasury: 'MH-CORE-SEND-TREASURY'
                },
                intermediary: {
                    transactional: 'MH-CORE-INTER-TRANSACTIONAL',
                    hold: 'MH-CORE-INTER-HOLD',
                    treasury: 'MH-CORE-INTER-TREASURY'
                },
                receiver: {
                    transactional: 'MH-CORE-RECEIVE-TRANSACTIONAL',
                    hold: 'MH-CORE-RECEIVE-HOLD',
                    treasury: 'MH-CORE-RECEIVE-TREASURY'
                }
            },
            subLedgers: {
                sender: {
                    transactional: 'MH-SUB-SEND-TRANSACTIONAL',
                    hold: 'MH-SUB-SEND-HOLD',
                    treasury: 'MH-SUB-SEND-TREASURY'
                },
                intermediary: {
                    transactional: 'MH-SUB-INTER-TRANSACTIONAL',
                    hold: 'MH-SUB-INTER-HOLD',
                    treasury: 'MH-SUB-INTER-TREASURY'
                },
                receiver: {
                    transactional: 'MH-SUB-RECEIVE-TRANSACTIONAL',
                    hold: 'MH-SUB-RECEIVE-HOLD',
                    treasury: 'MH-SUB-RECEIVE-TREASURY'
                }
            }
        },
        'request-to-pay': {
            coreLedgers: {
                sender: {
                    transactional: 'RTP-CORE-SEND-TRANSACTIONAL',
                    hold: 'RTP-CORE-SEND-HOLD',
                    treasury: 'RTP-CORE-SEND-TREASURY'
                },
                receiver: {
                    transactional: 'RTP-CORE-RECEIVE-TRANSACTIONAL',
                    hold: 'RTP-CORE-RECEIVE-HOLD',
                    treasury: 'RTP-CORE-RECEIVE-TREASURY'
                }
            },
            subLedgers: {
                sender: {
                    transactional: 'RTP-SUB-SEND-TRANSACTIONAL',
                    hold: 'RTP-SUB-SEND-HOLD',
                    treasury: 'RTP-SUB-SEND-TREASURY'
                },
                receiver: {
                    transactional: 'RTP-SUB-RECEIVE-TRANSACTIONAL',
                    hold: 'RTP-SUB-RECEIVE-HOLD',
                    treasury: 'RTP-SUB-RECEIVE-TREASURY'
                }
            }
        },
        'send-only': {
            coreLedgers: {
                receiver: {
                    transactional: 'SO-CORE-RECEIVE-TRANSACTIONAL',
                    hold: 'SO-CORE-RECEIVE-HOLD',
                    treasury: 'SO-CORE-RECEIVE-TREASURY'
                }
            },
            subLedgers: {
                receiver: {
                    transactional: 'SO-SUB-RECEIVE-TRANSACTIONAL',
                    hold: 'SO-SUB-RECEIVE-HOLD',
                    treasury: 'SO-SUB-RECEIVE-TREASURY'
                }
            }
        },
        'on-demand-liquidity': {
            'receive-side-exchange': {
                'mxn-balance': 'MXN Balance',
                'xrp-balance': 'XRP Balance'
            }
        }
    }
}

/**
 * Format a key into a specific capitalization format (eg: 'test-string-of-text' => 'Test String Of Text')
 * @function formatKey
 * @param {string} key - The string to convert
 * @returns {string} - The string provided, in the new format
 */
const formatKey = key => {
    return key.split('-').map(str => {
        return str.substr(0,1).toUpperCase() + str.substr(1,str.length).toLowerCase();
    }).join(' ');
}

const FlowLedger = ({ flowType, layout }) => {
    let coreLedgersElem = null;
    let subLedgersElem = null;
    let onDemandLiquidityElem = null;

    /**
     * Generate the markup for a specific ledger type
     * @function renderLedger
     * @param {string} ledgerType - Either 'coreLedgers' || 'subLedgers'
     * @returns {*} - The markup of the requested ledger
     */
    const renderLedger = ledgerType => {
        const ledgerTypeNoSpaces = ledgerType.replace(/ /g,'');
        const columns = Object.keys(configuration.flows[flowType][ledgerTypeNoSpaces]);

        return (
            <div className={classNames(styles.ledger__wrapper, {
                [styles['layout-right']]: layout === 'right'
            })}>
                <strong className={styles.ledger__heading}>{ledgerType}</strong>
                <ul className={classNames(styles.ledger__list,{
                    [styles[`columns-${columns.length}`]]: true
                })}>
                    {/* For flows which include SENDER Ledger data */}
                    {configuration.flows[flowType].coreLedgers.sender && (
                        <li>
                            {Object.keys(configuration.flows[flowType][ledgerTypeNoSpaces].sender).map(key => (
                                <Fragment key={uuidv1()}>
                                    <strong>{formatKey(key)}:</strong>&nbsp;<span className={styles.ledger__green}>{configuration.flows[flowType][ledgerTypeNoSpaces].sender[key]}</span>
                                    <br />
                                </Fragment>
                            ))}
                        </li>
                    )}
                    {/* For flows which include INTERMEDIARY Ledger data */}
                    {configuration.flows[flowType][ledgerTypeNoSpaces].intermediary && (
                        <li>
                            {Object.keys(configuration.flows[flowType][ledgerTypeNoSpaces].intermediary).map(key => (
                                <Fragment key={uuidv1()}>
                                    <strong>{formatKey(key)}:</strong>&nbsp;<span className={styles.ledger__green}>{configuration.flows[flowType][ledgerTypeNoSpaces].intermediary[key]}</span>
                                    <br />
                                </Fragment>
                            ))}
                        </li>
                    )}
                    {/* For flows which include RECEIVER Ledger data */}
                    {configuration.flows[flowType][ledgerTypeNoSpaces].receiver && (
                        <li>
                            {Object.keys(configuration.flows[flowType][ledgerTypeNoSpaces].receiver).map(key => (
                                <Fragment key={uuidv1()}>
                                    <strong>{formatKey(key)}:</strong>&nbsp;<span className={styles.ledger__green}>{configuration.flows[flowType][ledgerTypeNoSpaces].receiver[key]}</span>
                                    <br />
                                </Fragment>
                            ))}
                        </li>
                    )}
                </ul>
            </div>
        )
    }

    /**
     * Generate the markup for the 'On Demand Liquidity' ledger screen
     * @function renderOnDemandLiquidity
     * @returns {*} - The markup of the 'On Demand Liquidity'' ledger
     */
    const renderOnDemandLiquidity = () => (
        <div className={classNames(styles.ledger__wrapper, {
            [styles['layout-odl']]: true,
            [styles['layout-right']]: true
        })}>
            <strong className={styles.ledger__heading}>Receive-side exchange</strong>
            <ul className={styles.ledger__list}>
                <li>
                    <strong>MXN Balance</strong>&nbsp;<span className={styles.ledger__green}>{configuration.flows['on-demand-liquidity']['receive-side-exchange']['mxn-balance']}</span>
                </li>
                <li>
                    <strong>XRP Balance</strong>&nbsp;<span className={styles.ledger__green}>{configuration.flows['on-demand-liquidity']['receive-side-exchange']['xrp-balance']}</span>
                </li>
            </ul>
        </div>
    )

    // Generate the requested Ledger markup
    if(flowType !== 'on-demand-liquidity'){
        coreLedgersElem = renderLedger('core Ledgers');
        subLedgersElem = renderLedger('subLedgers');
    } else {
        // Specific layout for 'On Demand Liquidity' flow
        onDemandLiquidityElem = renderOnDemandLiquidity();
    }

    return (
        <Grid item xs={12} className={styles.screen}>
            <Paper className={styles.info}>
                <div className={styles.ledger}>
                    {coreLedgersElem}
                    {subLedgersElem}
                    {onDemandLiquidityElem}
                </div>
            </Paper>
        </Grid>
    )
}

export default FlowLedger;