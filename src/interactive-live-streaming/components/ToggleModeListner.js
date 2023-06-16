import { Popover, Transition } from "@headlessui/react";
import { DotsVerticalIcon } from "@heroicons/react/outline";
import {
  Constants,
  useMeeting,
  useParticipant,
  usePubSub,
} from "@videosdk.live/react-sdk";
import React, { Fragment, useEffect, useRef } from "react";
import ParticipantAddHostIcon from "../../icons/ParticipantTabPanel/ParticipantAddHostIcon";

const ToggleModeContainer = ({ participantId, participantMode }) => {
  const mMeetingRef = useRef();
  const mMeeting = useMeeting({});

  const { isLocal } = useParticipant(participantId);

  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  const { publish } = usePubSub(`CHANGE_MODE_${participantId}`, {});

  return (
    !isLocal && (
      <Popover>
        {({ open, close }) => (
          <>
            <Popover.Button>
              <DotsVerticalIcon aria-hidden="true" />
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
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    publish(
                      JSON.stringify({
                        mode:
                          participantMode === Constants.modes.CONFERENCE
                            ? Constants.modes.VIEWER
                            : Constants.modes.CONFERENCE,
                      })
                    );
                    close();
                  }}
                >
                  <div>
                    <div>
                      <ParticipantAddHostIcon
                        fill={
                          participantMode === Constants.modes.CONFERENCE
                            ? "#fff"
                            : "#9E9EA7"
                        }
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flex: 1,
                        flexDirection: "column",
                        marginLeft: 8,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 14,
                          marginTop: 2,
                          color:
                            participantMode === Constants.modes.CONFERENCE
                              ? "#fff"
                              : "#9E9EA7",
                        }}
                      >
                        {participantMode === Constants.modes.CONFERENCE
                          ? "Remove from Co-host"
                          : "Add as a Co-host"}
                      </p>
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    )
  );
};

export default ToggleModeContainer;
