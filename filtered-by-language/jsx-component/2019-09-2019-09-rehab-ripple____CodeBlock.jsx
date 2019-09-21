import React from 'react';
import classNames from "classnames";

// Syntax highlighter
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Key replacement
import KeyReplacement from '../../components/key-replacement/';

// Styles
import styles from "./CodeBlock.module.scss";

const CodeBlock = ({ headers = [], code, showDevice }) => {
    let list = null;
    if (headers.length > 0) {
        list = (
            <ul className={styles.headers}>
                {headers.map((header, index) => (
                    <li key={index}>
                        <strong className={styles.header__name}>{header.name}</strong>: {<KeyReplacement content={header.value} />}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <code className={classNames(styles.code__block, {
            [styles['showing--device']]: !showDevice
        })}>
            {list}
            <SyntaxHighlighter language="json" style={prism}>
                {code}
            </SyntaxHighlighter>
        </code>
    );
}

export default CodeBlock;