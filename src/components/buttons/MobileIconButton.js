import React, { useRef, useState } from "react";
import Lottie from "lottie-react";
import { createPopper } from "@popperjs/core";

export const MobileIconButton = ({
  badge,
  onClick,
  Icon,
  isFocused,
  bgColor,
  disabledOpacity,
  focusIconColor,
  disabled,
  large,
  tooltipTitle,
  btnID,
  buttonText,
  lottieOption,
}) => {
  const [mouseOver, setMouseOver] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  const [tooltipShow, setTooltipShow] = useState(false);
  const btnRef = useRef();
  const tooltipRef = useRef();

  const openTooltip = () => {
    createPopper(btnRef.current, tooltipRef.current, {
      placement: "bottom",
    });
    setTooltipShow(true);
  };
  const closeTooltip = () => {
    setTooltipShow(false);
  };

  const iconSize = 24 * (large ? 1.7 : 1);

  return (
    <>
      <div ref={btnRef} onMouseEnter={openTooltip} onMouseLeave={closeTooltip}>
        <div
          style={{
            transition: `all ${200 * 0.5}ms`,
            transitionTimingFunction: "linear",
          }}
        >
          <button
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
            id={btnID}
            onMouseEnter={() => {
              setMouseOver(true);
            }}
            onMouseLeave={() => {
              setMouseOver(false);
            }}
            onMouseDown={() => {
              setMouseDown(true);
            }}
            onMouseUp={() => {
              setMouseDown(false);
            }}
            disabled={disabled}
            onClick={onClick}
          >
            <div
              style={{
                opacity: disabled ? disabledOpacity || 0.7 : 1,
                transform: `scale(${mouseOver ? (mouseDown ? 0.95 : 1.1) : 1})`,
                transition: `all ${200 * 0.5}ms`,
                transitionTimingFunction: "linear",
              }}
            >
              {badge && <div>{badge}</div>}

              {lottieOption ? (
                <div style={{ backgroundColor: bgColor }}>
                  <div
                    style={{
                      height: iconSize,
                      width:
                        (iconSize * lottieOption?.width) / lottieOption?.height,
                    }}
                  >
                    <Lottie
                      loop={lottieOption.loop}
                      autoPlay={lottieOption.autoPlay}
                      animationData={lottieOption.animationData}
                      rendererSettings={{
                        preserveAspectRatio:
                          lottieOption.rendererSettings.preserveAspectRatio,
                      }}
                      isClickToPauseDisabled
                    />
                  </div>
                </div>
              ) : (
                <Icon
                  style={{
                    color: isFocused ? focusIconColor || "#fff" : "#95959E",
                    height: iconSize,
                    width: iconSize,
                  }}
                  fillcolor={isFocused ? focusIconColor || "#fff" : "#95959E"}
                />
              )}
            </div>
            <div>{buttonText ? <p>{buttonText}</p> : null}</div>
          </button>
        </div>
      </div>
      <div style={{ zIndex: 999 }} ref={tooltipRef}>
        <div>
          <p>{tooltipTitle || ""}</p>
        </div>
      </div>
    </>
  );
};
