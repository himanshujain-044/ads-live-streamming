import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { v4 as uuid } from "uuid";
import useIsMobile from "../../../hooks/useIsMobile";
import useIsTab from "../../../hooks/useIsTab";
import { useMeetingAppContext } from "../../../MeetingAppContextDef";
import { sideBarModes } from "../../../utils/common";

export const secondsToMinutes = (time) => {
  var minutes = Math.floor((time % 3600) / 60)
    .toString()
    .padStart(2, "0");
  var seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return minutes + " : " + seconds;
};

const Poll = ({ poll, isDraft, publishDraftPoll }) => {
  const timerIntervalRef = useRef();
  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });

  const equalSpacing = isXLDesktop
    ? 18
    : isLGDesktop
    ? 16
    : isTab
    ? 14
    : isMobile
    ? 12
    : 10;

  const { publish: EndPublish } = usePubSub(`END_POLL`);

  const { hasTimer, timeout, createdAt, isActive, index } = poll;

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerPollActive, setIsTimerPollActive] = useState(false);

  const mMeeting = useMeeting();

  const localParticipantId = useMemo(
    () => mMeeting?.localParticipant?.id,
    [mMeeting]
  );

  const isPollActive = useMemo(
    () => (hasTimer ? isTimerPollActive : isActive),
    [hasTimer, isTimerPollActive, isActive]
  );

  const { totalSubmissions, groupedSubmissionCount } = useMemo(() => {
    const localSubmittedOption = poll?.submissions?.find(
      ({ participantId }) => participantId === localParticipantId
    );

    const totalSubmissions = poll?.submissions?.length || 0;

    const groupedSubmissionCount = poll?.submissions?.reduce(
      (group, { optionId }) => {
        group[optionId] = group[optionId] || 0;

        group[optionId] += 1;

        return group;
      },
      {}
    );

    const maxSubmittedOptions = [];

    const maxSubmittedOptionId =
      groupedSubmissionCount &&
      Object.keys(groupedSubmissionCount)
        .map((optionId) => ({
          optionId,
          count: groupedSubmissionCount[optionId],
        }))
        .sort((a, b) => {
          if (a.count > b.count) {
            return -1;
          }
          if (a.count < b.count) {
            return 1;
          }
          return 0;
        })[0]?.optionId;

    groupedSubmissionCount &&
      Object.keys(groupedSubmissionCount).forEach((optionId) => {
        if (
          groupedSubmissionCount[optionId] ===
          groupedSubmissionCount[maxSubmittedOptionId]
        ) {
          maxSubmittedOptions.push(optionId);
        }
      });

    return {
      localSubmittedOption,
      totalSubmissions,
      groupedSubmissionCount,
      maxSubmittedOptions,
    };
  }, [poll, localParticipantId]);

  const checkTimeOver = ({ timeout, createdAt }) =>
    !(new Date(createdAt).getTime() + timeout * 1000 > new Date().getTime());

  useEffect(() => {
    const updateTimer = ({ timeout, createdAt }) => {
      if (checkTimeOver({ timeout, createdAt })) {
        setTimeLeft(0);
        setIsTimerPollActive(false);
        clearInterval(timerIntervalRef.current);
      } else {
        setTimeLeft(
          (new Date(createdAt).getTime() +
            timeout * 1000 -
            new Date().getTime()) /
            1000
        );
        setIsTimerPollActive(true);
      }
    };
    if (hasTimer) {
      updateTimer({ timeout, createdAt });

      if (!checkTimeOver({ timeout, createdAt })) {
        timerIntervalRef.current = setInterval(() => {
          updateTimer({ timeout, createdAt });
        }, 1000);
      }
    }

    return () => {
      clearInterval(timerIntervalRef.current);
    };
  }, [createdAt, hasTimer, timeout]);

  return (
    <div style={{ borderBottom: "1px solid #70707033" }}>
      <div>
        <div>
          <p>{`Poll ${index || ""}`}</p>
          <p>&#x2022;</p>
          <p>
            {isPollActive
              ? hasTimer
                ? `Ends in ${secondsToMinutes(timeLeft)}`
                : "Live"
              : isDraft
              ? "Draft"
              : "Ended"}
          </p>
        </div>
        <div>
          <p>{poll.question}</p>
          {poll.options.map((item, j) => {
            const total = groupedSubmissionCount
              ? groupedSubmissionCount[item.optionId]
              : 0;

            const percentage = (total ? total / totalSubmissions : 0) * 100;

            return (
              <div
                style={{
                  marginTop: j === 0 ? equalSpacing : equalSpacing / 2,
                }}
              >
                <p>{item.option}</p>
                <div>
                  <div>
                    <div style={{ width: `${percentage}%` }}></div>
                  </div>

                  {!isDraft && (
                    <div>
                      <p>{`${Math.floor(percentage)}%`}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div style={{ marginBottom: equalSpacing }}>
            {isDraft ? (
              <button
                onClick={() => {
                  publishDraftPoll(poll);
                }}
                style={{ marginTop: equalSpacing + 2 }}
              >
                Launch
              </button>
            ) : null}
            {isPollActive && !hasTimer ? (
              <button
                style={{ marginTop: equalSpacing + 2 }}
                onClick={() => {
                  EndPublish(
                    {
                      pollId: poll.id,
                    },
                    { persist: true }
                  );
                }}
              >
                End the Poll
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const PollList = ({ panelHeight }) => {
  const { polls, draftPolls, setSideBarMode } = useMeetingAppContext();
  const { publish: RemoveFromDraftPublish } = usePubSub(
    `REMOVE_POLL_FROM_DRAFT`
  );
  const { publish: publishCreatePoll } = usePubSub(`CREATE_POLL`);

  return (
    <div style={{ height: panelHeight - 14 }}>
      <div>
        <div>
          {draftPolls &&
            draftPolls.map((poll, index) => {
              return (
                <Poll
                  key={`draft_polls_${poll.id}`}
                  poll={poll}
                  panelHeight={panelHeight}
                  index={index}
                  isDraft={true}
                  publishDraftPoll={(poll) => {
                    //
                    RemoveFromDraftPublish(
                      { pollId: poll.id },
                      { persist: true }
                    );
                    //
                    publishCreatePoll(
                      {
                        id: uuid(),
                        question: poll.question,
                        options: poll.options,
                        timeout: poll.timeout,
                        hasTimer: poll.hasTimer,
                        hasCorrectAnswer: poll.hasCorrectAnswer,
                        isActive: true,
                        index: polls.length + 1,
                      },
                      { persist: true }
                    );
                    setSideBarMode(sideBarModes.POLLS);
                  }}
                />
              );
            })}
          {polls &&
            polls.map((poll, index) => {
              return (
                <Poll
                  key={`creator_polls_${poll.id}`}
                  poll={poll}
                  panelHeight={panelHeight}
                  index={index}
                />
              );
            })}
        </div>
        <div>
          <button
            onClick={() => {
              setSideBarMode(sideBarModes.CREATE_POLL);
            }}
          >
            Create new poll
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollList;
