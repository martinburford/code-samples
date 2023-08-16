// Components
import Icon from "@aigence/components/atoms/icon";

// NPM imports
import classnames from "classnames/bind";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

// Redux
import { setModalContentId } from "@aigence/store/global/slice";

// Scripts
import { useOnClickOutside } from "@aigence/scripts/hooks/useOnClickOutside";
import { bodyScrollLock, bodyScrollUnlock, buildDataAttributes } from "@aigence/scripts/utilities";

// Styles
import styles from "./modal.module.scss";

// Types
import { ESizes } from "@aigence/types/enums";
import { IModal } from "./types/modal.types";

export const Modal: React.FC<IModal> = ({
  children,
  dataAttributes = {},
  footer,
  header,
  lockBodyScroll = true,
  locked = false,
  onClose,
  parent = "#__next",
  position = "center",
  visible = false,
}) => {
  // Hooks (redux)
  const dispatch = useDispatch();

  // Hooks (refs)
  const modalRef = useRef<HTMLDivElement>(null);
  const modalOuterRef = useRef<HTMLDivElement>(null);

  // Hooks (state)
  const [state, updateState] = useState<{ visible: boolean }>({ visible });

  // Since eventListeners don't have access to updated state trees, use a ref as a pointer to the component state
  // eventListeners DO have access to state pointed at via a ref
  const visibilityStateRef = useRef(state);
  const updateVisibilityStateRef = (data) => {
    visibilityStateRef.current = data;
    updateState(data);
  };

  // De-structuring
  const { visible: isVisible } = state;

  // Handle the transitionEnd event, in terms of layering the modal DOM element correctly
  const transitionEnd = () => {
    if (visibilityStateRef.current.visible) {
      modalRef.current.setAttribute("data-previously-animated", "true");
      modalRef.current.setAttribute("data-visible", "true");
      modalRef.current.removeAttribute("data-animating-in");
    } else {
      modalRef.current.removeAttribute("data-animating-out");
      dispatch(setModalContentId(""));
    }
  };

  // Ensure any touch gestures are ignored, so as to not conflict with a visible / centered modal
  const blockTouchSwipe = (e) => {
    if (visible) {
      if (e.srcElement === modalRef.current) e.preventDefault();
    }
  };

  // On first load:
  // - Ensure that the Modal DOM element is moved to be a child element of the parent element (this is required so that relative positioning of other DOM elements don't interfere with the proposed positioning of the Modal when it's visible)
  // - Handle the transitionEnd event, in terms of layering the modal DOM element correctly
  useEffect(() => {
    let parentElem = document.body;

    if (parent !== "body") {
      parentElem = document.querySelector(parent);
    }

    // Move the Modal to the correct parent DOM element
    if (modalRef.current.parentNode !== parentElem) {
      parentElem.appendChild(modalRef.current);
    }
  }, [visible]);

  // Every time the visibility changes:
  // - Update local component state
  // - Assign necessary data attributes to maintain correct laying during an animation phase
  useEffect(() => {
    updateVisibilityStateRef({ visible });

    if (visible) {
      // Animating in
      modalRef.current.setAttribute("data-animating-in", "true");

      // Lock the body from scrolling whilst the modal is visible
      if (lockBodyScroll) {
        bodyScrollLock();
      }
    } else {
      // Animating out (only if previously animated)
      if (modalRef.current.hasAttribute("data-previously-animated")) {
        modalRef.current.setAttribute("data-animating-out", "true");
        modalRef.current.removeAttribute("data-previously-animated");
        modalRef.current.removeAttribute("data-visible");
      }

      // Unlock the body scroll capability
      if (lockBodyScroll) {
        bodyScrollUnlock();
      }
    }
  }, [visible]);

  useEffect(() => {
    // Attach an event listener to process the transition start / end
    modalRef.current.addEventListener("transitionend", (e) => {
      if (e.propertyName === "opacity") {
        transitionEnd();
      }
    });

    // Attach an event listener to ensure gesture based swiping isn't available whenever a modal is visible
    modalRef.current.addEventListener("touchstart", blockTouchSwipe);

    // Cleanup
    return () => {
      if (modalRef.current) {
        // Remove any previous transitionend listeners for this render on cleanup
        modalRef.current.removeEventListener("transitionend", transitionEnd);
        modalRef.current.removeEventListener("touchstart", blockTouchSwipe);
      }
    };
  }, []);

  // Hide modal when clicked outside of it
  useOnClickOutside(
    modalOuterRef,
    useCallback(() => {
      const isCurrentlyTransitioning = modalRef.current.hasAttribute("data-animating-in") || modalRef.current.hasAttribute("data-animating-out");
      if (!isCurrentlyTransitioning) onClose();
    }, [])
  );

  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  const classes = cx({
    modal: true,
    embedded: parent !== "body",
    [`position-${position}`]: true,
    visible: isVisible,
  });

  return (
    <>
      <div className={classes} {...buildDataAttributes("modal", dataAttributes)} ref={modalRef}>
        <div className={styles.outer} ref={modalOuterRef}>
          <div className={styles.header}>
            {header}
            <Icon expandedHitArea={ESizes.XS} disabled={locked} id="closeCircle" onClick={onClose} size={ESizes.M} />
          </div>
          <div className={styles.content} body-scroll-lock-ignore="true">
            {children}
          </div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </div>
    </>
  );
};

export default Modal;
