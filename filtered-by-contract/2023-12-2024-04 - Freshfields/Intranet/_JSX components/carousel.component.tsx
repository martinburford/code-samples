// Components
import WithStyles from "components/webparts/hoc/styles";

// NPM imports
import classnames from "classnames/bind";
import React, { useRef } from "react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Scripts
import { buildDataAttributes } from "scripts/utilities";

// Styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./swiper.scss";
import styles from "./carousel.module.scss";

// Types
import { ICarousel, TOnAutoplayTimeLeft } from "./types/carousel.types";

export const Carousel: React.FC<ICarousel> = ({ className, dataAttributes = {}, slides }) => {
  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  let classes = cx({
    carousel: true,
    "has-overlay-content": slides.some(slide => slide.overlay)
  });

  // Do custom utility classes need to be added?
  if (className) classes += ` ${className}`;

  // Hooks (refs)
  const progressCircleRef = useRef<SVGSVGElement>(null);
  const progressContentRef = useRef<HTMLSpanElement>(null);

  const onAutoplayTimeLeft: TOnAutoplayTimeLeft = (_, time, progress) => {
    progressCircleRef.current!.style.setProperty("--progress", String(1 - progress));
    progressContentRef.current!.textContent = `${Math.ceil(time / 1000)}s`;
  };

  return (
    <WithStyles>
      <div className={classes} {...buildDataAttributes("carousel", dataAttributes)}>
        <div className={styles.inner}>
          <Swiper
            autoHeight={true}
            autoplay={{
              delay: 6000,
              disableOnInteraction: false,
            }}
            className="mySwiper"
            loop={true}
            modules={[Autoplay, Navigation, Pagination]}
            navigation={true}
            onAutoplayTimeLeft={onAutoplayTimeLeft}
            spaceBetween={0}
            speed={500}
            pagination={true}
          >
            {slides.map((slide, index) => {
              const {
                image: { alt, src },
                overlay,
              } = slide;

              return (
                <SwiperSlide key={`slide-${index}`}>
                  <img alt={alt} src={src} />
                  {overlay && (
                    <div className={styles.content} data-content="true">
                      <a href={overlay.link.url}>{overlay.link.text}</a>
                    </div>
                  )}
                </SwiperSlide>
              )
            })}
            <div className="autoplay-progress" slot="container-end">
              <svg viewBox="0 0 48 48" ref={progressCircleRef}>
                <circle cx="24" cy="24" r="20"></circle>
              </svg>
              <span ref={progressContentRef}></span>
            </div>
          </Swiper>
        </div>
      </div>
    </WithStyles>
  );
};

export default Carousel;
