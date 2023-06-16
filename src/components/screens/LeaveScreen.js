export function LeaveScreen({ setIsMeetingLeft }) {
  return (
    <div>
      <h1>You left the meeting!</h1>
      <div>
        <button
          onClick={() => {
            setIsMeetingLeft(false);
          }}
        >
          Rejoin the Meeting
        </button>
      </div>
    </div>
  );
}
