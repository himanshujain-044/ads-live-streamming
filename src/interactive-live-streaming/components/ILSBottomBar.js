import {
  Constants,
  createCameraVideoTrack,
  useMeeting,
  usePubSub,
} from "@videosdk.live/react-sdk";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardIcon,
  CheckIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@heroicons/react/outline";
import recordingBlink from "../../static/animations/recording-blink.json";
import liveHLS from "../../static/animations/live-hls.json";
import useIsRecording from "../../hooks/useIsRecording";
import RecordingIcon from "../../icons/Bottombar/RecordingIcon";
import MicOnIcon from "../../icons/Bottombar/MicOnIcon";
import MicOffIcon from "../../icons/Bottombar/MicOffIcon";
import WebcamOnIcon from "../../icons/Bottombar/WebcamOnIcon";
import WebcamOffIcon from "../../icons/Bottombar/WebcamOffIcon";
import ScreenShareIcon from "../../icons/Bottombar/ScreenShareIcon";
import ChatIcon from "../../icons/Bottombar/ChatIcon";
import ParticipantsIcon from "../../icons/Bottombar/ParticipantsIcon";
import EndIcon from "../../icons/Bottombar/EndIcon";
import RaiseHandIcon from "../../icons/Bottombar/RaiseHandIcon";
import { OutlinedButton } from "../../components/buttons/OutlinedButton";
import { createPopper } from "@popperjs/core";
import useIsTab from "../../hooks/useIsTab";
import useIsMobile from "../../hooks/useIsMobile";
import { MobileIconButton } from "../../components/buttons/MobileIconButton";
import PollIcon from "../../icons/Bottombar/PollIcon";
import useIsHls from "../../hooks/useIsHls";
import LiveIcon from "../../icons/LiveIcon";
import ReactionIcon from "../../icons/Bottombar/ReactionIcon";
import { sideBarModes } from "../../utils/common";
import ECommerceIcon from "../../icons/Bottombar/ECommerceIcon";
import { Dialog, Popover, Transition } from "@headlessui/react";
import { useMeetingAppContext } from "../../MeetingAppContextDef";

export function ILSBottomBar({
  bottomBarHeight,
  setIsMeetingLeft,
  selectWebcamDeviceId,
  setSelectWebcamDeviceId,
  selectMicDeviceId,
  setSelectMicDeviceId,
  meetingMode,
}) {
  const { sideBarMode, setSideBarMode } = useMeetingAppContext();
  const RaiseHandBTN = ({ isMobile, isTab }) => {
    const { publish } = usePubSub("RAISE_HAND");
    const RaiseHand = () => {
      publish("Raise Hand");
    };

    return isMobile || isTab ? (
      <MobileIconButton
        id="RaiseHandBTN"
        tooltipTitle={"Raise hand"}
        Icon={RaiseHandIcon}
        onClick={RaiseHand}
        buttonText={"Raise Hand"}
      />
    ) : (
      <OutlinedButton
        onClick={RaiseHand}
        tooltip={"Raise Hand"}
        Icon={RaiseHandIcon}
      />
    );
  };

  const RecordingBTN = () => {
    const { startRecording, stopRecording, recordingState } = useMeeting();
    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: recordingBlink,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
      height: 64,
      width: 160,
    };

    const isRecording = useIsRecording();
    const isRecordingRef = useRef(isRecording);

    useEffect(() => {
      isRecordingRef.current = isRecording;
    }, [isRecording]);

    const { isRequestProcessing } = useMemo(
      () => ({
        isRequestProcessing:
          recordingState === Constants.recordingEvents.RECORDING_STARTING ||
          recordingState === Constants.recordingEvents.RECORDING_STOPPING,
      }),
      [recordingState]
    );

    const _handleClick = () => {
      const isRecording = isRecordingRef.current;

      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    };

    return (
      <OutlinedButton
        Icon={RecordingIcon}
        onClick={_handleClick}
        isFocused={isRecording}
        tooltip={
          recordingState === Constants.recordingEvents.RECORDING_STARTED
            ? "Stop Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STARTING
            ? "Starting Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPED
            ? "Start Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPING
            ? "Stopping Recording"
            : "Start Recording"
        }
        lottieOption={isRecording ? defaultOptions : null}
        isRequestProcessing={isRequestProcessing}
      />
    );
  };

  const MicBTN = () => {
    const mMeeting = useMeeting();
    const [mics, setMics] = useState([]);
    const localMicOn = mMeeting?.localMicOn;
    const changeMic = mMeeting?.changeMic;

    const getMics = async (mGetMics) => {
      const mics = await mGetMics();

      mics && mics?.length && setMics(mics);
    };

    const [tooltipShow, setTooltipShow] = useState(false);
    console.log(tooltipShow);
    const btnRef = useRef();
    const tooltipRef = useRef();

    const openTooltip = () => {
      createPopper(btnRef.current, tooltipRef.current, {
        placement: "top",
      });
      setTooltipShow(true);
    };
    const closeTooltip = () => {
      setTooltipShow(false);
    };

    return (
      <>
        <OutlinedButton
          Icon={localMicOn ? MicOnIcon : MicOffIcon}
          onClick={() => {
            mMeeting.toggleMic();
          }}
          bgColor={localMicOn ? "bg-gray-750" : "bg-white"}
          borderColor={localMicOn && "#ffffff33"}
          isFocused={localMicOn}
          focusIconColor={localMicOn && "white"}
          tooltip={"Toggle Mic"}
          renderRightComponent={() => {
            return (
              <>
                <Popover>
                  {({ close }) => (
                    <>
                      <Popover.Button>
                        <div
                          ref={btnRef}
                          onMouseEnter={openTooltip}
                          onMouseLeave={closeTooltip}
                        >
                          <button
                            onClick={(e) => {
                              getMics(mMeeting.getMics);
                            }}
                          >
                            <ChevronDownIcon
                              style={{
                                color: mMeeting.localMicOn ? "white" : "black",
                              }}
                            />
                          </button>
                        </div>
                      </Popover.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <Popover.Panel>
                          <div>
                            <div>
                              <div>
                                <div>
                                  <p>{"MICROPHONE"}</p>
                                </div>
                                <div>
                                  {mics.map(({ deviceId, label }, index) => (
                                    <div>
                                      <button
                                        key={`mics_${deviceId}`}
                                        onClick={() => {
                                          setSelectMicDeviceId(deviceId);
                                          changeMic(deviceId);
                                          close();
                                        }}
                                      >
                                        {label || `Mic ${index + 1}`}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Popover.Panel>
                      </Transition>
                    </>
                  )}
                </Popover>
                <div style={{ zIndex: 999 }} ref={tooltipRef}>
                  <div>
                    <p>{"Change microphone"}</p>
                  </div>
                </div>
              </>
            );
          }}
        />
      </>
    );
  };

  const WebCamBTN = () => {
    const mMeeting = useMeeting();
    const [webcams, setWebcams] = useState([]);

    const localWebcamOn = mMeeting?.localWebcamOn;
    const changeWebcam = mMeeting?.changeWebcam;

    const getWebcams = async (mGetWebcams) => {
      const webcams = await mGetWebcams();

      webcams && webcams?.length && setWebcams(webcams);
    };

    const [tooltipShow, setTooltipShow] = useState(false);
    console.log(tooltipShow);
    const btnRef = useRef();
    const tooltipRef = useRef();

    const openTooltip = () => {
      createPopper(btnRef.current, tooltipRef.current, {
        placement: "top",
      });
      setTooltipShow(true);
    };
    const closeTooltip = () => {
      setTooltipShow(false);
    };

    return (
      <>
        <OutlinedButton
          Icon={localWebcamOn ? WebcamOnIcon : WebcamOffIcon}
          onClick={async () => {
            let track;
            if (!localWebcamOn) {
              track = await createCameraVideoTrack({
                optimizationMode: "motion",
                encoderConfig: "h540p_w960p",
                facingMode: "environment",
                multiStream: false,
                cameraId: selectWebcamDeviceId,
              });
            }
            mMeeting.toggleWebcam(track);
          }}
          bgColor={localWebcamOn ? "bg-gray-750" : "bg-white"}
          borderColor={localWebcamOn && "#ffffff33"}
          isFocused={localWebcamOn}
          focusIconColor={localWebcamOn && "white"}
          tooltip={"Toggle Webcam"}
          renderRightComponent={() => {
            return (
              <>
                <Popover>
                  {({ close }) => (
                    <>
                      <Popover.Button>
                        <div
                          ref={btnRef}
                          onMouseEnter={openTooltip}
                          onMouseLeave={closeTooltip}
                        >
                          <button
                            onClick={(e) => {
                              getWebcams(mMeeting?.getWebcams);
                            }}
                          >
                            <ChevronDownIcon
                              style={{
                                color: localWebcamOn ? "white" : "black",
                              }}
                            />
                          </button>
                        </div>
                      </Popover.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <Popover.Panel>
                          <div>
                            <div>
                              <div>
                                <div>
                                  <p>{"WEBCAM"}</p>
                                </div>
                                <div>
                                  {webcams.map(({ deviceId, label }, index) => (
                                    <div>
                                      <button
                                        key={`output_webcams_${deviceId}`}
                                        onClick={async () => {
                                          setSelectWebcamDeviceId(deviceId);
                                          const track =
                                            await createCameraVideoTrack({
                                              optimizationMode: "motion",
                                              encoderConfig: "h540p_w960p",
                                              facingMode: "environment",
                                              multiStream: false,
                                              cameraId: deviceId,
                                            });
                                          changeWebcam(track);
                                          close();
                                        }}
                                      >
                                        {label || `Webcam ${index + 1}`}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Popover.Panel>
                      </Transition>
                    </>
                  )}
                </Popover>
                <div style={{ zIndex: 999 }} ref={tooltipRef}>
                  <div>
                    <p>{"Change webcam"}</p>
                  </div>
                </div>
              </>
            );
          }}
        />
      </>
    );
  };

  const ScreenShareBTN = ({ isMobile, isTab }) => {
    const { localScreenShareOn, toggleScreenShare, presenterId } = useMeeting();

    return isMobile || isTab ? (
      <MobileIconButton
        id="screen-share-btn"
        tooltipTitle={
          presenterId
            ? localScreenShareOn
              ? "Stop Presenting"
              : null
            : "Present Screen"
        }
        buttonText={
          presenterId
            ? localScreenShareOn
              ? "Stop Presenting"
              : null
            : "Present Screen"
        }
        isFocused={localScreenShareOn}
        Icon={ScreenShareIcon}
        onClick={() => {
          toggleScreenShare();
        }}
        disabled={
          presenterId
            ? localScreenShareOn
              ? false
              : true
            : isMobile
            ? true
            : false
        }
      />
    ) : (
      <OutlinedButton
        Icon={ScreenShareIcon}
        onClick={() => {
          toggleScreenShare();
        }}
        isFocused={localScreenShareOn}
        tooltip={
          presenterId
            ? localScreenShareOn
              ? "Stop Presenting"
              : null
            : "Present Screen"
        }
        disabled={presenterId ? (localScreenShareOn ? false : true) : false}
      />
    );
  };

  const LeaveBTN = () => {
    const { leave } = useMeeting();

    return (
      <OutlinedButton
        Icon={EndIcon}
        bgColor="bg-red-150"
        onClick={() => {
          leave();
          setIsMeetingLeft(true);
        }}
        tooltip="Leave Meeting"
      />
    );
  };

  const ChatBTN = ({ isMobile, isTab }) => {
    return isMobile || isTab ? (
      <MobileIconButton
        tooltipTitle={"Chat"}
        buttonText={"Chat"}
        Icon={ChatIcon}
        isFocused={sideBarMode === sideBarModes.CHAT}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.CHAT ? null : sideBarModes.CHAT
          );
        }}
      />
    ) : (
      <OutlinedButton
        Icon={ChatIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.CHAT ? null : sideBarModes.CHAT
          );
        }}
        isFocused={sideBarMode === "CHAT"}
        tooltip="View Chat"
      />
    );
  };

  const ParticipantsBTN = ({ isMobile, isTab }) => {
    const { participants } = useMeeting();
    return isMobile || isTab ? (
      <MobileIconButton
        tooltipTitle={"Participants"}
        isFocused={sideBarMode === sideBarModes.PARTICIPANTS}
        buttonText={"Participants"}
        disabledOpacity={1}
        Icon={ParticipantsIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.PARTICIPANTS ? null : sideBarModes.PARTICIPANTS
          );
        }}
        badge={`${new Map(participants)?.size}`}
        disabled={meetingMode === Constants.modes.VIEWER}
      />
    ) : (
      <OutlinedButton
        Icon={ParticipantsIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.PARTICIPANTS ? null : sideBarModes.PARTICIPANTS
          );
        }}
        isFocused={sideBarMode === sideBarModes.PARTICIPANTS}
        tooltip={"View Participants"}
        badge={`${new Map(participants)?.size}`}
        disabled={meetingMode === Constants.modes.VIEWER}
      />
    );
  };

  const PollBTN = ({ isMobile, isTab }) => {
    return isMobile || isTab ? (
      <MobileIconButton
        id="poll-btn"
        tooltipTitle={"Poll"}
        buttonText={"Poll"}
        isFocused={sideBarMode === sideBarModes.POLLS}
        Icon={PollIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.POLLS ? null : sideBarModes.POLLS
          );
        }}
      />
    ) : (
      <OutlinedButton
        Icon={PollIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.POLLS ? null : sideBarModes.POLLS
          );
        }}
        isFocused={sideBarMode === sideBarModes.POLLS}
        tooltip={"Poll"}
      />
    );
  };

  const HLSBTN = ({ isMobile, isTab }) => {
    const { startHls, stopHls, hlsState } = useMeeting({});

    const isHls = useIsHls();

    const { isRequestProcessing } = useMemo(
      () => ({
        isRequestProcessing:
          hlsState === Constants.hlsEvents.HLS_STARTING ||
          hlsState === Constants.hlsEvents.HLS_STOPPING,
      }),
      [hlsState]
    );

    const { type, priority, gridSize } = useMemo(
      () => ({
        type: "SPOTLIGHT",
        priority: "PIN",
        gridSize: "12",
      }),
      []
    );

    const typeRef = useRef(type);
    const priorityRef = useRef(priority);
    const gridSizeRef = useRef(gridSize);
    const isHlsRef = useRef(isHls);

    useEffect(() => {
      typeRef.current = type;
    }, [type]);

    useEffect(() => {
      priorityRef.current = priority;
    }, [priority]);

    useEffect(() => {
      gridSizeRef.current = gridSize;
    }, [gridSize]);

    useEffect(() => {
      isHlsRef.current = isHls;
    }, [isHls]);

    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: liveHLS,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
      height: 64,
      width: 170,
    };

    const _handleStartHLS = () => {
      const type = typeRef.current;
      const priority = priorityRef.current;
      const gridSize = gridSizeRef.current;

      const layout = { type, priority, gridSize };

      startHls({ layout, theme: "DARK" });
    };

    const _handleClick = () => {
      const isHls = isHlsRef.current;

      if (isHls) {
        stopHls();
      } else {
        _handleStartHLS();
      }
    };

    return isMobile || isTab ? (
      <MobileIconButton
        onClick={_handleClick}
        tooltipTitle={
          hlsState === Constants.hlsEvents.HLS_STARTED ||
          hlsState === Constants.hlsEvents.HLS_PLAYABLE
            ? "Stop HLS"
            : hlsState === Constants.hlsEvents.HLS_STARTING
            ? "Starting HLS"
            : hlsState === Constants.hlsEvents.HLS_STOPPED
            ? "Start HLS"
            : hlsState === Constants.hlsEvents.HLS_STOPPING
            ? "Stopping HLS"
            : "Start HLS"
        }
        Icon={LiveIcon}
        buttonText={
          hlsState === Constants.hlsEvents.HLS_STARTED ||
          hlsState === Constants.hlsEvents.HLS_PLAYABLE
            ? "Stop HLS"
            : hlsState === Constants.hlsEvents.HLS_STARTING
            ? "Starting HLS"
            : hlsState === Constants.hlsEvents.HLS_STOPPED
            ? "Start HLS"
            : hlsState === Constants.hlsEvents.HLS_STOPPING
            ? "Stopping HLS"
            : "Start HLS"
        }
        isFocused={isHls}
        lottieOption={isHls ? defaultOptions : null}
        isRequestProcessing={isRequestProcessing}
      />
    ) : null;
  };

  const ReactionBTN = ({ isMobile, isTab }) => {
    const [btnClicked, setBtnClicked] = useState(false);
    const { publish } = usePubSub("REACTION");

    const handleOpenMenu = (event) => {
      setBtnClicked(event.currentTarget);
    };

    const handleCloseMenu = () => {
      setBtnClicked(null);
    };

    function sendEmoji(emoji) {
      // Dispatch custom event here so the local user can see their own emoji
      window.dispatchEvent(
        new CustomEvent("reaction_added", { detail: { emoji } })
      );
      handleCloseMenu();
    }

    const emojiArray = [
      { emoji: "😍", emojiName: "heartEye" },
      { emoji: "😂", emojiName: "laugh" },
      { emoji: "👍", emojiName: "thumbsup" },
      { emoji: "🎉", emojiName: "confetti" },
      { emoji: "👏", emojiName: "clap" },
      { emoji: "❤️", emojiName: "heart" },
    ];

    return (
      <div>
        <Popover>
          {({ open }) => (
            <>
              <Popover.Button>
                <OutlinedButton
                  Icon={ReactionIcon}
                  onClick={(e) => {
                    handleOpenMenu(e);
                  }}
                  isFocused={btnClicked}
                  tooltip={"Reactions"}
                />
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel>
                  <div>
                    <div>
                      {emojiArray.map(({ emoji, emojiName }) => (
                        <button
                          key={`reaction-${emojiName}`}
                          onClick={() => {
                            sendEmoji(emojiName);
                            publish(emojiName);
                          }}
                        >
                          <p>{emoji}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    );
  };

  const ECommerceBTN = ({ isMobile, isTab }) => {
    return isMobile || isTab ? (
      <MobileIconButton
        id="ecommerce-btn"
        tooltipTitle={"Ecommerce"}
        buttonText={"Ecommerce"}
        isFocused={sideBarMode === sideBarModes.ECOMMERCE}
        Icon={ECommerceIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.ECOMMERCE ? null : sideBarModes.ECOMMERCE
          );
        }}
      />
    ) : (
      <OutlinedButton
        Icon={ECommerceIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.ECOMMERCE ? null : sideBarModes.ECOMMERCE
          );
        }}
        isFocused={sideBarMode === sideBarModes.ECOMMERCE}
        tooltip={"Ecommerce"}
      />
    );
  };

  const MeetingIdCopyBTN = () => {
    const { meetingId } = useMeeting();
    const [isCopied, setIsCopied] = useState(false);
    return (
      <div>
        <div>
          <h1>{meetingId}</h1>
          <button
            onClick={() => {
              navigator.clipboard.writeText(meetingId);
              setIsCopied(true);
              setTimeout(() => {
                setIsCopied(false);
              }, 3000);
            }}
          >
            {isCopied ? <CheckIcon /> : <ClipboardIcon />}
          </button>
        </div>
      </div>
    );
  };

  const tollTipEl = useRef();
  const isMobile = useIsMobile();
  const isTab = useIsTab();

  const [open, setOpen] = useState(false);

  const handleClickFAB = () => {
    setOpen(true);
  };

  const handleCloseFAB = () => {
    setOpen(false);
  };

  const BottomBarButtonTypes = useMemo(
    () => ({
      END_CALL: "END_CALL",
      CHAT: "CHAT",
      PARTICIPANTS: "PARTICIPANTS",
      SCREEN_SHARE: "SCREEN_SHARE",
      WEBCAM: "WEBCAM",
      MIC: "MIC",
      RAISE_HAND: "RAISE_HAND",
      RECORDING: "RECORDING",
      MEETING_ID_COPY: "MEETING_ID_COPY",
      HLS: "HLS",
      POLL: "POLL",
      REACTION: "REACTION",
      ECOMMERCE: "ECOMMERCE",
    }),
    []
  );

  const otherFeatures = [
    { icon: BottomBarButtonTypes.RAISE_HAND },
    { icon: BottomBarButtonTypes.CHAT },
    { icon: BottomBarButtonTypes.PARTICIPANTS },
    { icon: BottomBarButtonTypes.MEETING_ID_COPY },
    { icon: BottomBarButtonTypes.POLL },
    { icon: BottomBarButtonTypes.REACTION },
    { icon: BottomBarButtonTypes.ECOMMERCE },
  ];

  if (meetingMode === Constants.modes.CONFERENCE) {
    otherFeatures.pop({ icon: BottomBarButtonTypes.REACTION });
    otherFeatures.push({ icon: BottomBarButtonTypes.SCREEN_SHARE });
    otherFeatures.push({ icon: BottomBarButtonTypes.HLS });
  }

  return isMobile || isTab ? (
    <div style={{ height: bottomBarHeight }}>
      <LeaveBTN />
      {meetingMode === Constants.modes.CONFERENCE && (
        <>
          <MicBTN />
          <WebCamBTN />
          <RecordingBTN />
        </>
      )}
      <OutlinedButton Icon={DotsHorizontalIcon} onClick={handleClickFAB} />

      <Transition appear show={Boolean(open)} as={Fragment}>
        <Dialog as="div" style={{ zIndex: 9999 }} onClose={handleCloseFAB}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="translate-y-full opacity-0 scale-95"
            enterTo="translate-y-0 opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="translate-y-0 opacity-100 scale-100"
            leaveTo="translate-y-full opacity-0 scale-95"
          >
            <div>
              <div>
                <Dialog.Panel>
                  <div>
                    <div>
                      {otherFeatures.map(({ icon }) => {
                        return (
                          <div>
                            {icon === BottomBarButtonTypes.RAISE_HAND ? (
                              <RaiseHandBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon === BottomBarButtonTypes.SCREEN_SHARE ? (
                              <ScreenShareBTN
                                isMobile={isMobile}
                                isTab={isTab}
                              />
                            ) : icon === BottomBarButtonTypes.CHAT ? (
                              <ChatBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon === BottomBarButtonTypes.PARTICIPANTS ? (
                              <ParticipantsBTN
                                isMobile={isMobile}
                                isTab={isTab}
                              />
                            ) : icon ===
                              BottomBarButtonTypes.MEETING_ID_COPY ? (
                              <MeetingIdCopyBTN
                                isMobile={isMobile}
                                isTab={isTab}
                              />
                            ) : icon === BottomBarButtonTypes.HLS ? (
                              <HLSBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon === BottomBarButtonTypes.POLL ? (
                              <PollBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon === BottomBarButtonTypes.REACTION &&
                              meetingMode === Constants.modes.VIEWER ? (
                              <ReactionBTN isMobile={isMobile} isTab={isTab} />
                            ) : meetingMode === Constants.modes.VIEWER ? (
                              <ECommerceBTN isMobile={isMobile} isTab={isTab} />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
      {/* <SwipeableDrawer
        anchor={"bottom"}
        open={Boolean(open)}
        onClose={handleCloseFAB}
        onOpen={handleClickFAB}
        style={{ paddingBottom: "100px" }}
      >
        <Grid container className="bg-gray-800 py-6">
          {otherFeatures.map(({ icon }) => {
            return (
              <Grid
                className="flex items-center justify-center"
                item
                xs={icon === BottomBarButtonTypes.MEETING_ID_COPY ? 7 : 4}
                sm={icon === BottomBarButtonTypes.MEETING_ID_COPY ? 5 : 3}
                md={icon === BottomBarButtonTypes.MEETING_ID_COPY ? 3 : 2}
              >
                {icon === BottomBarButtonTypes.RAISE_HAND ? (
                  <RaiseHandBTN isMobile={isMobile} isTab={isTab} />
                ) : icon === BottomBarButtonTypes.SCREEN_SHARE ? (
                  <ScreenShareBTN isMobile={isMobile} isTab={isTab} />
                ) : icon === BottomBarButtonTypes.CHAT ? (
                  <ChatBTN isMobile={isMobile} isTab={isTab} />
                ) : icon === BottomBarButtonTypes.PARTICIPANTS ? (
                  <ParticipantsBTN isMobile={isMobile} isTab={isTab} />
                ) : icon === BottomBarButtonTypes.MEETING_ID_COPY ? (
                  <MeetingIdCopyBTN isMobile={isMobile} isTab={isTab} />
                ) : icon === BottomBarButtonTypes.HLS ? (
                  <HLSBTN isMobile={isMobile} isTab={isTab} />
                ) : icon === BottomBarButtonTypes.POLL ? (
                  <PollBTN isMobile={isMobile} isTab={isTab} />
                ) : icon === BottomBarButtonTypes.REACTION &&
                  meetingMode === Constants.modes.VIEWER ? (
                  <ReactionBTN isMobile={isMobile} isTab={isTab} />
                ) : meetingMode === Constants.modes.VIEWER ? (
                  <ECommerceBTN isMobile={isMobile} isTab={isTab} />
                ) : null}
              </Grid>
            );
          })}
        </Grid>
      </SwipeableDrawer> */}
    </div>
  ) : (
    <div>
      <MeetingIdCopyBTN />

      <div ref={tollTipEl}>
        {meetingMode === Constants.modes.CONFERENCE && (
          <ScreenShareBTN isMobile={isMobile} isTab={isTab} />
        )}
        <RaiseHandBTN isMobile={isMobile} isTab={isTab} />
        {meetingMode === Constants.modes.VIEWER && (
          <ReactionBTN isMobile={isMobile} isTab={isTab} />
        )}
        {meetingMode === Constants.modes.CONFERENCE && (
          <>
            <MicBTN />
            <WebCamBTN />
          </>
        )}
        <LeaveBTN />
      </div>
      <div>
        {meetingMode === Constants.modes.VIEWER && (
          <ECommerceBTN isMobile={isMobile} isTab={isTab} />
        )}
        <PollBTN isMobile={isMobile} isTab={isTab} />
        <ChatBTN isMobile={isMobile} isTab={isTab} />
        <ParticipantsBTN isMobile={isMobile} isTab={isTab} />
      </div>
    </div>
  );
}
