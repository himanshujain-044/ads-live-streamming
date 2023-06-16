import { CheckIcon, ClipboardIcon } from "@heroicons/react/outline";
import { Constants } from "@videosdk.live/react-sdk";
import React, { useState } from "react";

export function MeetingDetailsScreen({
  onClickJoin,
  _handleOnCreateMeeting,
  participantName,
  setParticipantName,
  videoTrack,
  setVideoTrack,
  onClickStartMeeting,
  setMeetingMode,
  meetingMode,
}) {
  const [studioCode, setStudioCode] = useState("");
  const [studioCodeError, setStudioCodeError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [iscreateMeetingClicked, setIscreateMeetingClicked] = useState(false);
  const [isJoinMeetingClicked, setIsJoinMeetingClicked] = useState(false);

  return (
    <div>
      {iscreateMeetingClicked ? (
        <div>
          <p>{`Studio code : ${studioCode}`}</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(studioCode);
              setIsCopied(true);
              setTimeout(() => {
                setIsCopied(false);
              }, 3000);
            }}
          >
            {isCopied ? <CheckIcon /> : <ClipboardIcon />}
          </button>
        </div>
      ) : isJoinMeetingClicked ? (
        <>
          <input
            defaultValue={studioCode}
            onChange={(e) => {
              setStudioCode(e.target.value);
            }}
            placeholder={"Enter studio code"}
          />
          {studioCodeError && <p>Please enter valid studioCode</p>}
        </>
      ) : null}

      {(iscreateMeetingClicked || isJoinMeetingClicked) && (
        <>
          <input
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="Enter your name"
          />
          <button
            disabled={participantName.length < 3}
            onClick={(e) => {
              if (iscreateMeetingClicked) {
                if (videoTrack) {
                  videoTrack.stop();
                  setVideoTrack(null);
                }
                onClickStartMeeting();
              } else {
                if (studioCode.match("\\w{4}\\-\\w{4}\\-\\w{4}")) {
                  onClickJoin(studioCode);
                } else setStudioCodeError(true);
              }
            }}
          >
            {iscreateMeetingClicked
              ? "Start a meeting"
              : isJoinMeetingClicked &&
                meetingMode === Constants.modes.CONFERENCE
              ? "Join Studio"
              : "Join Streaming Room"}
          </button>
        </>
      )}

      {!iscreateMeetingClicked && !isJoinMeetingClicked && (
        <div>
          <div>
            <button
              onClick={async (e) => {
                const studioCode = await _handleOnCreateMeeting();
                setStudioCode(studioCode);
                setIscreateMeetingClicked(true);
                setMeetingMode(Constants.modes.CONFERENCE);
              }}
            >
              Create a meeting
            </button>

            <button
              onClick={async (e) => {
                setIsJoinMeetingClicked(true);
                setMeetingMode(Constants.modes.CONFERENCE);
              }}
            >
              Join as a Host
            </button>
            <button
              onClick={(e) => {
                setIsJoinMeetingClicked(true);
                setMeetingMode(Constants.modes.VIEWER);
              }}
            >
              Join as a Viewer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
