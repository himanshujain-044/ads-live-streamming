import React from "react";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import { ParticipantView } from "./ParticipantView";

const MemoizedParticipant = React.memo(
  ParticipantView,
  (prevProps, nextProps) => {
    return prevProps.participantId === nextProps.participantId;
  }
);

function ParticipantGrid({ participantIds, isPresenting }) {
  const { sideBarMode } = useMeetingAppContext();
  console.log(sideBarMode);
  const isMobile = window.matchMedia(
    "only screen and (max-width: 768px)"
  ).matches;

  const perRow =
    isMobile || isPresenting
      ? participantIds.length < 4
        ? 1
        : participantIds.length < 9
        ? 2
        : 3
      : participantIds.length < 5
      ? 2
      : participantIds.length < 7
      ? 3
      : participantIds.length < 9
      ? 4
      : participantIds.length < 10
      ? 3
      : participantIds.length < 11
      ? 4
      : 4;

  return (
    <div>
      <div>
        {Array.from(
          { length: Math.ceil(participantIds.length / perRow) },
          (_, i) => {
            return (
              <div key={`participant-${i}`}>
                {participantIds
                  .slice(i * perRow, (i + 1) * perRow)
                  .map((participantId) => {
                    return (
                      <div key={`participant_${participantId}`}>
                        <MemoizedParticipant participantId={participantId} />
                      </div>
                    );
                  })}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

export const MemoizedParticipantGrid = React.memo(
  ParticipantGrid,
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.participantIds) ===
        JSON.stringify(nextProps.participantIds) &&
      prevProps.isPresenting === nextProps.isPresenting
    );
  }
);
