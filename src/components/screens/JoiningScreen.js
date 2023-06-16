import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { MeetingDetailsScreen } from "../MeetingDetailsScreen";
import { createMeeting, getToken, validateMeeting } from "../../api";
import { CheckCircleIcon } from "@heroicons/react/outline";
import SettingDialogueBox from "../SettingDialogueBox";
import ConfirmBox from "../ConfirmBox";
import { Constants } from "@videosdk.live/react-sdk";
import useIsMobile from "../../hooks/useIsMobile";
import { createPopper } from "@popperjs/core";
import WebcamOffIcon from "../../icons/WebcamOffIcon";
import WebcamOnIcon from "../../icons/Bottombar/WebcamOnIcon";
import MicOffIcon from "../../icons/MicOffIcon";
import MicOnIcon from "../../icons/Bottombar/MicOnIcon";

export function JoiningScreen({
  participantName,
  setParticipantName,
  setMeetingId,
  setToken,
  setSelectedMic,
  setSelectedWebcam,
  onClickStartMeeting,
  micEnabled,
  webcamEnabled,
  setWebcamOn,
  setMicOn,
  setMeetingMode,
  meetingMode,
}) {
  const [setting, setSetting] = useState("video");
  const [{ webcams, mics }, setDevices] = useState({
    devices: [],
    webcams: [],
    mics: [],
  });

  const [videoTrack, setVideoTrack] = useState(null);

  const [dlgMuted, setDlgMuted] = useState(false);
  const [dlgDevices, setDlgDevices] = useState(false);

  const videoPlayerRef = useRef();
  const popupVideoPlayerRef = useRef();
  const popupAudioPlayerRef = useRef();

  const videoTrackRef = useRef();
  const audioTrackRef = useRef();
  const audioAnalyserIntervalRef = useRef();

  const [settingDialogueOpen, setSettingDialogueOpen] = useState(false);

  const [audioTrack, setAudioTrack] = useState(null);

  // const handleClickOpen = () => {
  //   setSettingDialogueOpen(true);
  // };

  const handleClose = (value) => {
    setSettingDialogueOpen(false);
  };

  const isMobile = useIsMobile();

  const webcamOn = useMemo(() => !!videoTrack, [videoTrack]);
  const micOn = useMemo(() => !!audioTrack, [audioTrack]);

  const _handleTurnOffWebcam = useCallback(() => {
    const videoTrack = videoTrackRef.current;

    if (videoTrack) {
      videoTrack.stop();
      setVideoTrack(null);
      setWebcamOn(false);
    }
  }, [setWebcamOn]);
  const _handleTurnOnWebcam = () => {
    const videoTrack = videoTrackRef.current;

    if (!videoTrack) {
      getDefaultMediaTracks({ mic: false, webcam: true });
      setWebcamOn(true);
    }
  };

  const _toggleWebcam = () => {
    const videoTrack = videoTrackRef.current;

    if (videoTrack) {
      _handleTurnOffWebcam();
    } else {
      _handleTurnOnWebcam();
    }
  };
  const _handleTurnOffMic = useCallback(() => {
    const audioTrack = audioTrackRef.current;

    if (audioTrack) {
      audioTrack.stop();

      setAudioTrack(null);
      setMicOn(false);
    }
  }, [setMicOn]);
  const _handleTurnOnMic = () => {
    const audioTrack = audioTrackRef.current;

    if (!audioTrack) {
      getDefaultMediaTracks({ mic: true, webcam: false });
      setMicOn(true);
    }
  };
  const _handleToggleMic = () => {
    const audioTrack = audioTrackRef.current;

    if (audioTrack) {
      _handleTurnOffMic();
    } else {
      _handleTurnOnMic();
    }
  };

  const changeWebcam = async (deviceId) => {
    const currentvideoTrack = videoTrackRef.current;

    if (currentvideoTrack) {
      currentvideoTrack.stop();
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId },
    });
    const videoTracks = stream.getVideoTracks();

    const videoTrack = videoTracks.length ? videoTracks[0] : null;

    setVideoTrack(videoTrack);
  };
  const changeMic = async (deviceId) => {
    const currentAudioTrack = audioTrackRef.current;
    currentAudioTrack && currentAudioTrack.stop();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId },
    });
    const audioTracks = stream.getAudioTracks();

    const audioTrack = audioTracks.length ? audioTracks[0] : null;
    clearInterval(audioAnalyserIntervalRef.current);

    setAudioTrack(audioTrack);
  };

  const getDefaultMediaTracks = useCallback(
    async ({ mic, webcam, firstTime }) => {
      if (mic) {
        const audioConstraints = {
          audio: true,
        };

        const stream = await navigator.mediaDevices.getUserMedia(
          audioConstraints
        );
        const audioTracks = stream.getAudioTracks();

        const audioTrack = audioTracks.length ? audioTracks[0] : null;

        setAudioTrack(audioTrack);
        if (firstTime) {
          setSelectedMic({
            id: audioTrack?.getSettings()?.deviceId,
          });
        }
      }

      if (webcam) {
        const videoConstraints = {
          video: {
            width: 1280,
            height: 720,
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(
          videoConstraints
        );
        const videoTracks = stream.getVideoTracks();

        const videoTrack = videoTracks.length ? videoTracks[0] : null;
        setVideoTrack(videoTrack);
        if (firstTime) {
          setSelectedWebcam({
            id: videoTrack?.getSettings()?.deviceId,
          });
        }
      }
    },
    [setSelectedMic, setSelectedWebcam]
  );

  async function startMuteListener() {
    const currentAudioTrack = audioTrackRef.current;

    if (currentAudioTrack) {
      if (currentAudioTrack.muted) {
        setDlgMuted(true);
      }

      currentAudioTrack.addEventListener("mute", (ev) => {
        setDlgMuted(true);
      });
    }
  }

  useEffect(() => {
    audioTrackRef.current = audioTrack;

    startMuteListener();

    return () => {
      const currentAudioTrack = audioTrackRef.current;
      currentAudioTrack && currentAudioTrack.stop();
      audioTrackRef.current = null;
    };
  }, [audioTrack]);

  useEffect(() => {
    if (meetingMode === Constants.modes.VIEWER) {
      _handleTurnOffMic();
      _handleTurnOffWebcam();
    }
  }, [_handleTurnOffMic, _handleTurnOffWebcam, meetingMode]);

  useEffect(() => {
    videoTrackRef.current = videoTrack;

    if (videoTrack) {
      const videoSrcObject = new MediaStream([videoTrack]);

      if (videoPlayerRef.current) {
        videoPlayerRef.current.srcObject = videoSrcObject;
        videoPlayerRef.current.play();
      }

      setTimeout(() => {
        if (popupVideoPlayerRef.current) {
          popupVideoPlayerRef.current.srcObject = videoSrcObject;
          popupVideoPlayerRef.current.play();
        }
      }, 1000);
    } else {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.srcObject = null;
      }
      if (popupVideoPlayerRef.current) {
        popupVideoPlayerRef.current.srcObject = null;
      }
    }
  }, [videoTrack, setting, settingDialogueOpen]);

  useEffect(() => {
    const getDevices = async ({ micEnabled, webcamEnabled }) => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        const webcams = devices.filter((d) => d.kind === "videoinput");
        const mics = devices.filter((d) => d.kind === "audioinput");

        const hasMic = mics.length > 0;
        const hasWebcam = webcams.length > 0;

        setDevices({ webcams, mics, devices });

        if (hasMic) {
          startMuteListener();
        }

        getDefaultMediaTracks({
          mic: hasMic && micEnabled,
          webcam: hasWebcam && webcamEnabled,
          firstTime: true,
        });
      } catch (err) {
        console.log(err);
      }
    };

    getDevices({ micEnabled, webcamEnabled });
  }, [getDefaultMediaTracks, micEnabled, webcamEnabled]);

  const ButtonWithTooltip = ({ onClick, onState, OnIcon, OffIcon, mic }) => {
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
        <div>
          <button
            ref={btnRef}
            onMouseEnter={openTooltip}
            onMouseLeave={closeTooltip}
            onClick={onClick}
            disabled={meetingMode === Constants.modes.VIEWER}
          >
            {onState ? (
              <OnIcon fillcolor={onState ? "#050A0E" : "#fff"} />
            ) : (
              <OffIcon fillcolor={onState ? "#050A0E" : "#fff"} />
            )}
          </button>
        </div>
        <div style={{ zIndex: 999 }} ref={tooltipRef}>
          <div>
            <p>
              {onState
                ? `Turn off ${mic ? "mic" : "webcam"}`
                : `Turn on ${mic ? "mic" : "webcam"}`}
            </p>
          </div>
        </div>
      </>
    );
  };

  return (
    <div>
      <div>
        <div>
          <div>
            <div>
              <div>
                <div>
                  <div>
                    <div>
                      <video
                        autoPlay
                        playsInline
                        muted
                        ref={videoPlayerRef}
                        controls={false}
                        style={{
                          backgroundColor: "#1c1c1c",
                        }}
                      />

                      {!isMobile ? (
                        <>
                          <div>
                            {!webcamOn ? (
                              <p>
                                {meetingMode === Constants.modes.VIEWER
                                  ? "You are not permitted to use your microphone and camera."
                                  : "The camera is off"}
                              </p>
                            ) : null}
                          </div>
                        </>
                      ) : null}

                      {settingDialogueOpen ? (
                        <SettingDialogueBox
                          open={settingDialogueOpen}
                          onClose={handleClose}
                          popupVideoPlayerRef={popupVideoPlayerRef}
                          popupAudioPlayerRef={popupAudioPlayerRef}
                          changeWebcam={changeWebcam}
                          changeMic={changeMic}
                          setting={setting}
                          setSetting={setSetting}
                          webcams={webcams}
                          mics={mics}
                          setSelectedMic={setSelectedMic}
                          setSelectedWebcam={setSelectedWebcam}
                          videoTrack={videoTrack}
                          audioTrack={audioTrack}
                        />
                      ) : null}

                      {meetingMode === Constants.modes.CONFERENCE && (
                        <div>
                          <div>
                            <ButtonWithTooltip
                              onClick={_handleToggleMic}
                              onState={micOn}
                              mic={true}
                              OnIcon={MicOnIcon}
                              OffIcon={MicOffIcon}
                            />
                            <ButtonWithTooltip
                              onClick={_toggleWebcam}
                              onState={webcamOn}
                              mic={false}
                              OnIcon={WebcamOnIcon}
                              OffIcon={WebcamOffIcon}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {!isMobile &&
                      meetingMode === Constants.modes.CONFERENCE && (
                        <div>
                          <div>
                            <button>
                              <CheckCircleIcon />
                            </button>
                            <p>Check your audio and video</p>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
              <div>
                <div>
                  <MeetingDetailsScreen
                    participantName={participantName}
                    setParticipantName={setParticipantName}
                    videoTrack={videoTrack}
                    setVideoTrack={setVideoTrack}
                    setMeetingMode={setMeetingMode}
                    meetingMode={meetingMode}
                    onClickStartMeeting={onClickStartMeeting}
                    onClickJoin={async (id) => {
                      const token = await getToken();
                      const valid = await validateMeeting({
                        roomId: id,
                        token,
                      });

                      if (valid) {
                        setToken(token);
                        setMeetingId(id);
                        if (videoTrack) {
                          videoTrack.stop();
                          setVideoTrack(null);
                        }
                        onClickStartMeeting();
                        setParticipantName("");
                      } else alert("Invalid Meeting Id");
                    }}
                    _handleOnCreateMeeting={async () => {
                      const token = await getToken();
                      const _meetingId = await createMeeting({ token });
                      setToken(token);
                      setMeetingId(_meetingId);
                      setParticipantName("");
                      return _meetingId;
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmBox
        open={dlgMuted}
        successText="OKAY"
        onSuccess={() => {
          setDlgMuted(false);
        }}
        title="System mic is muted"
        subTitle="You're default microphone is muted, please unmute it or increase audio
            input volume from system settings."
      />

      <ConfirmBox
        open={dlgDevices}
        successText="DISMISS"
        onSuccess={() => {
          setDlgDevices(false);
        }}
        title="Mic or webcam not available"
        subTitle="Please connect a mic and webcam to speak and share your video in the meeting. You can also join without them."
      />
    </div>
  );
}
