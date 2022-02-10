import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Lottie from 'react-lottie';

class lottie extends Component {
  constructor(props) {
    super(props);

    this.sequenceData = this.props.sequence.items;

    // What's the data for the current animation?
    const animationData = this.getCurrentAnimationData(
      this.props.sequence.starting
    );

    // Initial base state
    this.state = {
      animationOptions: {
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
        ...animationData.options,
      },
      height: this.props.height,
      onComplete: () => {
        if (animationData.onComplete) {
          // Switch to a new animation
          this.switchToAnimation(animationData.onComplete.runAnimation);
        }
      },
      speed: animationData.speed,
      width: this.props.width,
    };
  }

  /**
   * Switch to a new animation
   * @param {string} sequenceName - The name of the sequence to update Lottie for
   */
  switchToAnimation(sequenceName) {
    // What's the data for the current animation?
    const animationData = this.getCurrentAnimationData(sequenceName);

    this.setState(prevState => ({
      animationOptions: {
        rendererSettings: {
          ...prevState.animationOptions.rendererSettings,
        },
        ...animationData.options,
      },
      height: prevState.height,
      onComplete: () => {
        if (animationData.onComplete) {
          // Switch to a new animation
          this.switchToAnimation(animationData.onComplete.runAnimation);
        }
      },
      speed: animationData.speed,
      width: prevState.width,
    }));
  }

  /**
   * What's the data for the current animation?
   * @function getCurrentAnimationData
   * @param {string} sequenceName - The name of the sequence to retrieve data for
   * @param {object} - The data for the requested animation
   */
  getCurrentAnimationData(sequenceName) {
    return this.sequenceData.find(item => item.name === sequenceName);
  }

  render() {
    return (
      <div className="lottie">
        <Lottie
          eventListeners={[
            {
              eventName: 'complete',
              callback: () => this.state.onComplete(),
            },
          ]}
          height={this.state.height}
          options={this.state.animationOptions}
          speed={this.state.speed}
          width={this.state.width}
        />
      </div>
    );
  }
}

lottie.propTypes = {
  height: PropTypes.number.isRequired,
  sequence: PropTypes.shape({
    starting: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        options: PropTypes.shape({
          animationData: PropTypes.object.isRequired,
          autoplay: PropTypes.bool,
          loop: PropTypes.bool,
        }),
        name: PropTypes.string.isRequired,
        onComplete: PropTypes.shape({
          runAnimation: PropTypes.string,
        }),
        speed: PropTypes.number,
      })
    ).isRequired,
  }).isRequired,
  width: PropTypes.number.isRequired,
};

export default lottie;
