import React, { useState, useRef, useEffect } from "react";
import Lottie from "lottie-react";
import { createPopper } from "@popperjs/core";

const OutlineIconTextButton = ({
  onClick,
  isFocused,
  bgColor,
  Icon,
  focusBGColor,
  disabled,
  renderRightComponent,
  fillcolor,
  lottieOption,
  tooltipTitle,
  btnID,
  buttonText,
  large,
  isRequestProcessing,
  textColor,
}) => {
  const [mouseOver, setMouseOver] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [blinkingState, setBlinkingState] = useState(1);
  const [tooltipShow, setTooltipShow] = useState(false);
  console.log(tooltipShow);
  const btnRef = useRef();
  const tooltipRef = useRef();
  const intervalRef = useRef();

  const openTooltip = () => {
    createPopper(btnRef.current, tooltipRef.current, {
      placement: "bottom",
    });
    setTooltipShow(true);
  };
  const closeTooltip = () => {
    setTooltipShow(false);
  };

  const iconSize = 22 * (large ? 1 : 1);

  const startBlinking = () => {
    intervalRef.current = setInterval(() => {
      setBlinkingState((s) => (s === 1 ? 0.4 : 1));
    }, 600);
  };

  const stopBlinking = () => {
    clearInterval(intervalRef.current);

    setBlinkingState(1);
  };

  useEffect(() => {
    if (isRequestProcessing) {
      startBlinking();
    } else {
      stopBlinking();
    }
  }, [isRequestProcessing]);

  useEffect(() => {
    return () => {
      stopBlinking();
    };
  }, []);

  return (
    <>
      <div ref={btnRef} onMouseEnter={openTooltip} onMouseLeave={closeTooltip}>
        <button
          style={{
            transition: "all 200ms",
            transitionTimingFunction: "ease-in-out",
            opacity: blinkingState,
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
              opacity: disabled ? 0.7 : 1,
              transform: `scale(${mouseOver ? (mouseDown ? 0.97 : 1.05) : 1})`,
              transition: `all ${200 * 1}ms`,
              transitionTimingFunction: "linear",
            }}
          >
            {buttonText ? (
              lottieOption ? (
                <div>
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
                <p>{buttonText}</p>
              )
            ) : null}
          </div>

          {typeof renderRightComponent === "function" && renderRightComponent()}
        </button>
      </div>
      <div style={{ zIndex: 999 }} ref={tooltipRef}>
        <div>
          <p>{tooltipTitle || ""}</p>
        </div>
      </div>
    </>
  );
};

export default OutlineIconTextButton;
