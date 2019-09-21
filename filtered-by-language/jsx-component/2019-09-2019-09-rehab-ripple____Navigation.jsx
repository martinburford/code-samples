import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

import flows from "../../data/flows";

// Redux
import { createFlow } from "../../redux/flow/actions";

// Styles
import styles from "./Navigation.module.scss";

const Navigation = props => {
    const resetToNewSection = flowData => {
        // Create a new flow, resetting the step to 0, since the intro screen will be shown first
        const flowDataWithResetStep = {
            ...flowData,
            currentStep: 0
        };

        props.redux.actions.createFlow(flowDataWithResetStep);
    }

    const sideNav = () => (
        <div
            role="presentation"
            onClick={props.toggleDrawer(false)}
            className={styles.navigation__nav}
        >
            <List>
                <ListItem>
                    <Link to="/">Create New Flow</Link>
                </ListItem>
                {flows.map((flow, i) => (
                    <ListItem key={i}>
                        <Link to={`/flows/${flow.slug}/intro`} onClick={() => resetToNewSection(flow)}>
                            {flow.name}
                        </Link>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Drawer
            anchor="right"
            open={props.open}
            onClose={props.toggleDrawer(false)}
            className={styles.navigation}
        >
            <div className={styles.navigation__header}>
                <IconButton onClick={props.toggleDrawer(false)}>
                    <CloseIcon />
                </IconButton>
            </div>
            {sideNav()}
        </Drawer>
    );
};

// Map Redux state to component props
const mapStateToProps = state => ({
    demo: {
        ...state.demoReducer
    },
    flow: {
        ...state.flowReducer
    }
});

// Map Redux dispatch to component props
const mapDispatchToProps = dispatch => ({
    createFlow: flow => dispatch(createFlow(flow))
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
        mapDispatchToProps,
        mergeProps
    )(Navigation)
);