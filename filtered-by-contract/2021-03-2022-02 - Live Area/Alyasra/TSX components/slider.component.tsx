import classnames from 'classnames/bind';
import RCSlider from 'rc-slider';
import React, { useEffect, useState } from 'react';

// Scripts
import { buildDataAttributes } from 'scripts/utilities';

// Styles
import styles from './slider.module.scss';

// Types
import { ISlider } from './types/slider.types';

export const Slider: React.FC<ISlider> = ({
  dataAttributes = {},
  initial,
  rtl = false,
  scale,
  theme = 'purple',
  title,
}) => {
  const { createSliderWithTooltip } = RCSlider;
  const Range = createSliderWithTooltip(RCSlider.Range);

  // What scale should the slider be setup to work with?
  const { max: maxScale, min: minScale } = scale;

  // What are the initial slider range minimum and maximum values?
  const { max: maxInitial, min: minInitial } = initial;

  // Hooks
  const [state, updateState] = useState({
    loaded: false,
  });

  // Because of the way rc-slider works (or doesn't) with SSR, force a client-side only render when the component mounts for the firt time
  useEffect(() => {
    updateState({
      loaded: true,
    });
  }, []);

  // If a client-side load is complete, render the component
  // In doing this, it means there is no mis-match in server and client renders of HTML code, resulting in broken CSS layouts of the slider instances
  let sliderElem = state.loaded ? (
    <Range
      allowCross={false}
      defaultValue={[minInitial, maxInitial]}
      dotStyle={{
        display: 'none',
      }}
      marks={{
        [minScale]: {
          label: minScale,
          style: {
            top: -50,
          },
        },
        [maxScale]: {
          label: maxScale,
          style: {
            top: -50,
          },
        },
      }}
      max={maxScale}
      min={minScale}
      onAfterChange={e => console.log(`<Slider>: onAfterChange: range between ${e[0]} and ${e[1]}`)}
      reverse={rtl}
      tipFormatter={value => value}
      tipProps={{
        placement: 'bottom',
        visible: true,
      }}
    />
  ) : null;

  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  const classes = cx({
    slider: true,
    [theme]: true,
  });

  return (
    <div className={classes} {...buildDataAttributes('slider', dataAttributes)}>
      <strong className={styles.title}>{title}</strong>
      {sliderElem}
    </div>
  );
};

export default Slider;
