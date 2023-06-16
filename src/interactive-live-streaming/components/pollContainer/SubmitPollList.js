import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import React, { useMemo, useRef, useState, useEffect } from "react";
import AnswerSubmittedIcon from "../../../icons/Poll/AnswerSubmittedIcon";
import CorrectSelectedIcon from "../../../icons/Poll/CorrectSelectedIcon";
import NoPollActiveIcon from "../../../icons/Poll/NoPollActiveIcon";
import WrongOptionSelectedIcon from "../../../icons/Poll/WrongOptionSelectedIcon";
import { secondsToMinutes } from "./PollList";
import { createPopper } from "@popperjs/core";
import { Input } from "@windmill/react-ui";
import { useMeetingAppContext } from "../../../MeetingAppContextDef";

const SubmitPollListItem = ({ poll }) => {
  const timerIntervalRef = useRef();

  const mMeeting = useMeeting();

  const localParticipantId = useMemo(
    () => mMeeting?.localParticipant?.id,
    [mMeeting]
  );

  const { publish } = usePubSub(`SUBMIT_A_POLL_${poll.id}`);

  const { hasCorrectAnswer, hasTimer, timeout, createdAt, isActive, index } =
    poll;

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerPollActive, setIsTimerPollActive] = useState(false);

  const isPollActive = useMemo(
    () => (hasTimer ? isTimerPollActive : isActive),
    [hasTimer, isTimerPollActive, isActive]
  );

  const {
    localSubmittedOption,
    totalSubmissions,
    groupedSubmissionCount,
    maxSubmittedOptions,
  } = useMemo(() => {
    const localSubmittedOption = poll.submissions.find(
      ({ participantId }) => participantId === localParticipantId
    );

    const totalSubmissions = poll.submissions.length;

    const groupedSubmissionCount = poll.submissions.reduce(
      (group, { optionId }) => {
        group[optionId] = group[optionId] || 0;

        group[optionId] += 1;

        return group;
      },
      {}
    );

    const maxSubmittedOptions = [];

    const maxSubmittedOptionId = Object.keys(groupedSubmissionCount)
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

  const TooltipIconRender = ({ Icon, tooltipTitle }) => {
    const [tooltipShow, setTooltipShow] = useState(false);
    const btnRef = useRef();
    const tooltipRef = useRef();

    const openTooltip = () => {
      createPopper(btnRef.current, tooltipRef.current, {
        placement: "right",
      });
      setTooltipShow(true);
    };
    const closeTooltip = () => {
      setTooltipShow(false);
    };
    return (
      <>
        <div
          ref={btnRef}
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltip}
        >
          <div>
            <Icon />
          </div>
        </div>
        <div style={{ zIndex: 999 }} ref={tooltipRef}>
          <div>
            <p>{tooltipTitle}</p>
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={{ borderBottom: "1px solid #70707033" }}>
      <div>
        <div>
          <p>{`Poll ${index}`}</p>
          <p>&#x2022;</p>
          <p>
            {isPollActive
              ? hasTimer
                ? `Ends in ${secondsToMinutes(timeLeft)}`
                : "Live"
              : "Ended"}
          </p>
        </div>
        <div>
          <p>{poll.question}</p>
          <div>
            {localSubmittedOption || !isPollActive
              ? poll.options.map((option) => {
                  const total = groupedSubmissionCount[option.optionId];

                  const isOptionSubmittedByLocal =
                    localSubmittedOption?.optionId === option.optionId;

                  const percentage =
                    (total ? total / totalSubmissions : 0) * 100;

                  const isOptionSelectedByLocalIncorrect =
                    localSubmittedOption?.optionId === option.optionId &&
                    !option.isCorrect;

                  const isCorrectOption = option.isCorrect;

                  return (
                    <div>
                      <div>
                        <div>
                          <p>{option.option}</p>

                          {isPollActive ? (
                            isOptionSubmittedByLocal ? (
                              <div>
                                <AnswerSubmittedIcon />
                              </div>
                            ) : null
                          ) : hasCorrectAnswer ? (
                            isCorrectOption ? (
                              <TooltipIconRender
                                Icon={CorrectSelectedIcon}
                                tooltipTitle={"Correct Answer"}
                              />
                            ) : isOptionSelectedByLocalIncorrect ? (
                              <TooltipIconRender
                                Icon={WrongOptionSelectedIcon}
                                tooltipTitle={"Your answer is wrong"}
                              />
                            ) : null
                          ) : null}
                        </div>
                        <div>
                          <div>
                            <div style={{ width: `${percentage}%` }}></div>
                          </div>
                          <div>
                            <p>{`${Math.floor(percentage)}%`}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              : poll?.options.map((option) => {
                  return (
                    <div>
                      <Input
                        type="checkbox"
                        onClick={() => {
                          publish(
                            { optionId: option.optionId },
                            { persist: true }
                          );
                        }}
                      />

                      <div style={{ padding: "8px 8px 8px" }}>
                        <p>{option.option}</p>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </div>
  );
};

const SubmitPollList = ({ panelHeight }) => {
  const { polls } = useMeetingAppContext();
  return (
    <div style={{ height: panelHeight - 14 }}>
      <div>
        {polls?.length > 0 ? (
          polls?.map((poll, index) => {
            return (
              <SubmitPollListItem
                key={`submit_polls_${poll.id}`}
                totalPolls={polls.length}
                poll={poll}
                panelHeight={panelHeight}
                index={index}
              />
            );
          })
        ) : (
          <div style={{ marginTop: "-50px" }}>
            <NoPollActiveIcon />
            <p>No Poll has been launched yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitPollList;
