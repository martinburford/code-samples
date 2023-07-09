import classnames from 'classnames/bind';
import React, { useEffect, useRef, useState } from 'react';

// Components
import HeaderBar from 'components/ui/molecules/header-bar';
import Icon from 'components/ui/atoms/icon';

// Scripts
import { buildDataAttributes } from 'scripts/utilities';

// Styles
import styles from './modal.module.scss';

// Types
import { IModal } from './types/modal.types';

// Height clipping only needs to be performed on touch devices (iOS specifically), which this synta x is valid for
let isIOSTouchCapable = false;

// Which DOM element needs its height clipped, to resolve iOS Safari elastic bounce issues?
let clipElem;

export const Modal: React.FC<IModal> = ({
  children,
  dataAttributes = {},
  footer,
  header,
  lockBodyScroll = true,
  onClose,
  parent = '#__next',
  position = 'center',
  visible = false,
}) => {
  // Hooks
  let modalRef = useRef<HTMLDivElement>(null);

  // Set the visibility in local component state
  const [state, updateState] = useState<{ visible: boolean }>({ visible });

  // De-structuring
  const { visible: isVisible } = state;

  // Handle the transitionEnd event, in terms of layering the modal DOM element correctly
  const transitionEnd = () => {
    if (visible) {
      modalRef.current.setAttribute('data-previously-animated', 'true');
      modalRef.current.setAttribute('data-visible', 'true');
      modalRef.current.removeAttribute('data-animating-in');
    } else {
      modalRef.current.removeAttribute('data-animating-out');
    }
  };

  // On first load:
  // - Ensure that the Modal DOM element is moved to be a child element of the parent elemen (this is required so that relative positioning of other DOM elements don't interfere with the proposed positioning of the Modal when it's visible)
  // - Handle the transitionEnd event, in terms of layering the modal DOM element correctly
  useEffect(() => {
    let parentElem = document.body;

    if (parent !== 'body') {
      parentElem = document.querySelector(parent);
    }

    // Move the Modal to the correct parent DOM element
    if (modalRef.current.parentNode !== parentElem) {
      parentElem.appendChild(modalRef.current);
    }

    clipElem = document.getElementById('__next');
    isIOSTouchCapable = 'ontouchstart' in window;
  }, []);

  // Every time the visibility changes:
  // - Update local component state
  // - Assign necessary data attributes to maintain correct laying during an animation phase
  useEffect(() => {
    updateState({ visible });

    if (visible) {
      // Animating in
      modalRef.current.setAttribute('data-animating-in', 'true');

      // Lock the body scroll capability
      if (lockBodyScroll) {
        document.body.classList.add('no-scroll');

        // Because of elastic bounce (and dynamically sized address bar and bookmark bar is iOS Safari), use the position:fixed modal to derive the capped height of the body height overflow / clip area
        if (isIOSTouchCapable) {
          clipElem.style.height = `${modalRef.current.clientHeight}px`;
        }
      }
    } else {
      // Animating out (only if previously animated)
      if (modalRef.current.hasAttribute('data-previously-animated')) {
        modalRef.current.setAttribute('data-animating-out', 'true');
        modalRef.current.removeAttribute('data-previously-animated');
        modalRef.current.removeAttribute('data-visible');
      }

      // Unlock the body scroll capability
      if (lockBodyScroll) {
        document.body.classList.remove('no-scroll');

        // Remove any fixed clip area
        if (isIOSTouchCapable) {
          clipElem.style.removeProperty('height');
        }
      }
    }

    // Attach an event listener to process the transition start / end
    modalRef.current.addEventListener('transitionend', transitionEnd);

    // Cleanup
    return () => {
      if (modalRef.current) {
        // Remove any previous transitionend listeners for this render on cleanup
        modalRef.current.removeEventListener('transitionend', transitionEnd);
      }
    };
  }, [visible]);

  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  const classes = cx({
    modal: true,
    embedded: parent !== 'body',
    [`position-${position}`]: true,
    visible: isVisible,
  });

  return (
    <>
      <div className={classes} {...buildDataAttributes('modal', dataAttributes)} ref={modalRef}>
        <div className={styles.outer}>
          <div className={styles.header}>
            <HeaderBar title={header} />
            <Icon colour="purple" id="close" onClick={onClose} />
          </div>
          <div className={styles.content}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </div>
    </>
  );
};

export default Modal;
