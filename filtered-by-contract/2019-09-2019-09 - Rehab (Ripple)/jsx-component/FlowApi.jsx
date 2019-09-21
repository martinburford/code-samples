import React from "react";

import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import ReactCardFlip from 'react-card-flip';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

// Unique UIDs
import uuidv1 from 'uuid/v1';

// API code block
import CodeBlock from '../code-block';

// Key replacement
import KeyReplacement from '../../components/key-replacement/';

// Styles
import styles from "./FlowApi.module.scss";
import './react-card-flip.scss';

// Images
import flipImage from '../../assets/images/flip.png';

const FlowApi = ({ copy, data: { front, back }, isFlipped, onFlipCard, showDevice }) => {
    // Replace all dynamic tags before rendering within the tabs
    const frontCode = <KeyReplacement content={JSON.stringify(front.data, null, 2)} debug={true} />
    const backCode = <KeyReplacement content={JSON.stringify(back, null, 2)} debug={true} />

    // Construct the headers content
    let headers = null;
    if(front.headers.length > 0){
        headers = (
            <ul className={styles.header__list}>
                {front.headers.map(header => (
                    <li key={uuidv1()}><strong>{header.name}</strong>: <KeyReplacement content={header.value} /></li>
                ))}
            </ul>
        )
    }

    return (
        <Grid item xs={12} className={styles.screen}>
            <ReactCardFlip isFlipped={isFlipped} flipDirection="vertical">
                <Paper className={styles.api} key="front">
                    <Typography variant="body1">{copy}</Typography>
                    <img
                        alt="Flip"
                        className={styles.flip}
                        onClick={() => onFlipCard('back')}
                        src={flipImage} />
                </Paper>
                <Paper className={styles.api} key="back">
                    <Tabs>
                        <TabList>
                            <Tab>Request</Tab>
                            <Tab>Response</Tab>
                        </TabList>
                        <TabPanel>
                            {headers}
                            <CodeBlock
                                showDevice={showDevice}
                                code={frontCode} />
                        </TabPanel>
                        <TabPanel>
                            <CodeBlock
                                showDevice={showDevice}
                                code={backCode} />
                        </TabPanel>
                    </Tabs>
                    <img
                        alt="Flip"
                        className={styles.flip}
                        onClick={() => onFlipCard('front')}
                        src={flipImage} />
                </Paper>
            </ReactCardFlip>
        </Grid>
    );
};

export default FlowApi;
