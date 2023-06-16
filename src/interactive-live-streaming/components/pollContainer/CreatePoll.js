import { useMemo, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { usePubSub } from "@videosdk.live/react-sdk";
import { sideBarModes } from "../../../utils/common";
import { Input, Label } from "@windmill/react-ui";
import { XIcon } from "@heroicons/react/outline";
import { useMeetingAppContext } from "../../../MeetingAppContextDef";

const CreatePollPart = ({
  isMarkAsCorrectChecked,
  setIsMarkAsCorrectChecked,
  isSetTimerChecked,
  setIsSetTimerChecked,
  question,
  setQuestion,
  questionErr,
  option,
  setOption,
  options,
  setOptions,
  setTimer,
  _handleKeyDown,
  timer,
  timerErr,
  correctAnswerErr,
  minOptionErr,
  optionErr,
}) => {
  const createOptionRef = useRef(null);
  //for timer
  const pollTimerArr = useMemo(() => {
    const pollTimerArr = [{ value: 30, Label: "30 secs" }];
    for (let i = 1; i < 11; i++) {
      pollTimerArr.push({
        value: i * 60,
        Label: `${i} min${i === 1 ? "" : "s"}`,
      });
    }
    return pollTimerArr;
  }, []);

  const focusCreateOption = () => {
    setTimeout(() => {
      createOptionRef.current.focus();
    }, 500);
  };

  return (
    <div>
      <input
        type="text"
    
        placeholder="What you want to ask ?"
        autoFocus
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {questionErr && (
        <div >
          <p >Please enter proper question.</p>
        </div>
      )}

      <div>
        {/* option list  */}
        <div>
          {options.length > 0 && (
            <div>
              {options.map((item) => {
                return (
                  <div >
                    {isMarkAsCorrectChecked && item.option.length !== 0 && (
                      <Input
                        type="checkbox"
                        value={item.isCorrect}
                        checked={item.isCorrect === true}
                        onChange={() => {
                          setOptions(
                            options.map((option) => {
                              if (option.optionId === item.optionId) {
                                option.isCorrect = !option.isCorrect;
                              } else {
                                option.isCorrect = false;
                              }
                              return option;
                            })
                          );
                        }}
                      
                      />
                    )}
                    <div
                  
                    >
                      <input
                        type="text"
                        
                        placeholder="Add your options"
                        autocomplete="off"
                        value={item.option}
                        onBlur={_handleKeyDown}
                        onChange={(e) => {
                          setOptions(
                            options.map((option) => {
                              if (option.optionId === item.optionId) {
                                option.option = e.target.value;
                                if (e.target.value === "" && item.isCorrect) {
                                  option.isCorrect = false;
                                }
                              }
                              return option;
                            })
                          );
                        }}
                      />
                      <button
                       
                        onClick={() => {
                          setOptions((options) => {
                            const newOptions = options.filter(
                              ({ optionId }) => {
                                return optionId !== item.optionId;
                              }
                            );
                            return newOptions;
                          });
                        }}
                      >
                        <XIcon
                     
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* end of option list */}

        <div>
          {/* old Text */}
          <div >
            {isMarkAsCorrectChecked && option.option && (
              <Input
                type="checkbox"
                value={option.isCorrect}
                checked={option.isCorrect === true}
                onChange={(e) => {
                  setOptions((options) => {
                    return [
                      ...options.map((option) => {
                        return { ...option, isCorrect: false };
                      }),
                      {
                        ...option,
                        isCorrect: e.target.checked,
                      },
                    ];
                  });

                  setOption({
                    option: "",
                    isCorrect: false,
                  });
                }}
               
              />
            )}
            <input
              type={"text"}
              placeholder="Add your options"
              inputref={createOptionRef}
            
              ref={createOptionRef}
              autoComplete="off"
              value={option.option}
              onChange={(e) =>
                setOption({
                  optionId: uuid(),
                  option: e.target.value,
                  isCorrect: !!option.isCorrect,
                })
              }
              onKeyDown={_handleKeyDown}
              onBlur={_handleKeyDown}
            />
          </div>
          {/* end of old Text */}

          {/* dummy Text */}
          {option?.option?.length > 0 && (
            <div style={{ display: "flex" }}>
              <input
                type={"text"}
                placeholder="Add your options"
                autocomplete="off"
                onChange={(e) => {}}
                onFocus={(e) => {
                  _handleKeyDown(e);
                  focusCreateOption();
                }}
               
              />
            </div>
          )}
          {/* end of dummy Text */}

          {minOptionErr && (
            <p >
              Please add atleast 2 options.
            </p>
          )}
          {optionErr && (
            <p >
              Please enter valid option value.
            </p>
          )}
          <div >
            <div >
              <Label check>
                <Input
                  type="checkbox"
                  onClick={(e) => {
                    setIsMarkAsCorrectChecked((s) => !s);
                  }}
                
                />
                <p>Mark correct option</p>
              </Label>
            </div>
            {correctAnswerErr && (
              <p>
                {
                  "Please check any one option as correct if `isMarkAsCorrectChecked`"
                }
              </p>
            )}
            <div>
              <div >
                <div >
                  <Label check>
                    <Input
                      type="checkbox"
                      onClick={(e) => {
                        setIsSetTimerChecked((s) => !s);
                      }}
                     
                    />
                    <p>Set Timer</p>
                  </Label>
                </div>
                {isSetTimerChecked && (
                  <select
                    value={timer}
                    onChange={(e) => {
                      setTimer(e.target.value);
                    }}
                
                  >
                    {pollTimerArr.map((item) => {
                      return (
                        <option value={item.value}>
                          {item.Label}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
              <div >
                {timerErr && (
                  <p>
                    {"Timer should be more than 30 seconds."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PollButtonPart = ({
  publishCreatePoll,
  publishDraftPoll,
  question,
  options,
  timer,
  setQuestionErr,
  isMarkAsCorrectChecked,
  isSetTimerChecked,
  setTimerErr,
  setCorrectAnswerErr,
  setMinOptionErr,
  setOptionErr,
}) => {
  const { polls, setSideBarMode } = useMeetingAppContext();
  const singleOption = options?.map((option) => {
    return option.option;
  });

  const handleValidation = ({
    question,
    options,
    isSetTimerChecked,
    timer,
    isMarkAsCorrectChecked,
  }) => {
    let isValid = true;

    if (
      question.length >= 2 &&
      /^[^-\s][a-zA-Z0-9_!@#$%^&*()`~.,<>{}[\]<>?_=+\-|;:\\'\\"\\/\s-]+$/i.test(
        //did some chnages in regex string
        question.trim()
      )
    ) {
      setQuestionErr(false);
    } else {
      isValid = false;
      setQuestionErr(true);
      return false;
    }

    if (options?.length < 2) {
      isValid = false;
      setMinOptionErr(true);
      return false;
    } else {
      setMinOptionErr(false);
    }

    for (let i = 0; i < singleOption.length; i++) {
      if (singleOption[i].length < 1) {
        isValid = false;
        setOptionErr(true);
        return false;
      } else {
        setOptionErr(false);
      }
    }

    // check time timer if `isSetTimerChecked`
    if (isSetTimerChecked && timer < 30) {
      isValid = false;
      setTimerErr(true);
      return false;
    } else {
      setTimerErr(false);
    }

    if (
      isMarkAsCorrectChecked &&
      options.findIndex(({ isCorrect }) => isCorrect) === -1
    ) {
      // please check any one option as correct if `isMarkAsCorrectChecked`
      isValid = false;
      setCorrectAnswerErr(true);
      return false;
    } else {
      setCorrectAnswerErr(false);
    }

    return isValid;
  };

  return (
    <div >
      <button
        
        onClick={() => {
          const isValid = handleValidation({
            question,
            options,
            isSetTimerChecked,
            isMarkAsCorrectChecked,
            timer,
          });

          if (isValid) {
            publishDraftPoll(
              {
                id: uuid(),
                question: question.trim(),
                options: options.map((option) => ({
                  ...option,
                  option: option.option.trim(),
                })),
                timeout: isSetTimerChecked ? timer : 0,
                hasCorrectAnswer: isMarkAsCorrectChecked ? true : false,
                hasTimer: isSetTimerChecked ? true : false,
                isActive: false,
              },
              {
                persist: true,
              }
            );
            setSideBarMode(sideBarModes.POLLS);
          }
        }}
      >
        Save
      </button>
      <button
   
        onClick={() => {
          const isValid = handleValidation({
            question,
            options,
            isSetTimerChecked,
            isMarkAsCorrectChecked,
            timer,
          });

          if (isValid) {
            publishCreatePoll(
              {
                id: uuid(),
                question: question.trim(),
                options: options.map((option) => ({
                  ...option,
                  option: option.option.trim(),
                })),
                timeout: isSetTimerChecked ? timer : 0,
                hasCorrectAnswer: isMarkAsCorrectChecked ? true : false,
                hasTimer: isSetTimerChecked ? true : false,
                isActive: true,
                index: polls.length + 1,
              },
              { persist: true }
            );
            setSideBarMode(sideBarModes.POLLS);
          }
        }}
      >
        Launch
      </button>
    </div>
  );
};

const CreatePoll = ({ panelHeight }) => {
  const [isMarkAsCorrectChecked, setIsMarkAsCorrectChecked] = useState(false);
  const [isSetTimerChecked, setIsSetTimerChecked] = useState(false);
  const [question, setQuestion] = useState("");
  const [questionErr, setQuestionErr] = useState(false);
  const [optionErr, setOptionErr] = useState(false);
  const [option, setOption] = useState({
    optionId: uuid(),
    option: null,
    isCorrect: false,
  });
  const [options, setOptions] = useState([]);
  const [timer, setTimer] = useState(30);
  const [timerErr, setTimerErr] = useState(false);
  const [correctAnswerErr, setCorrectAnswerErr] = useState(false);
  const [minOptionErr, setMinOptionErr] = useState(false);

  const _handleKeyDown = (e) => {
    if (
      e.key === "Enter" ||
      e.type === "mouseleave" ||
      e.type === "focus" ||
      e.type === "blur"
    ) {
      if (option?.option?.length >= 1 && option?.option.trim()) {
        e.preventDefault();
        setOptions([...options, option]);
        setOption({ option: "", isCorrect: false });
      }
    }
  };

  const { publish: publishCreatePoll } = usePubSub(`CREATE_POLL`);
  const { publish: publishDraftPoll } = usePubSub(`DRAFT_A_POLL`);
  const Height = panelHeight;

  return (
    <div
     
      style={{ height: Height }}
    >
      <div >
        <CreatePollPart
          isMarkAsCorrectChecked={isMarkAsCorrectChecked}
          setIsMarkAsCorrectChecked={setIsMarkAsCorrectChecked}
          isSetTimerChecked={isSetTimerChecked}
          setIsSetTimerChecked={setIsSetTimerChecked}
          question={question}
          setQuestion={setQuestion}
          questionErr={questionErr}
          option={option}
          setOption={setOption}
          options={options}
          setOptions={setOptions}
          _handleKeyDown={_handleKeyDown}
          setTimer={setTimer}
          timer={timer}
          timerErr={timerErr}
          correctAnswerErr={correctAnswerErr}
          minOptionErr={minOptionErr}
          optionErr={optionErr}
        />
        <PollButtonPart
          publishCreatePoll={publishCreatePoll}
          publishDraftPoll={publishDraftPoll}
          question={question}
          options={options}
          timer={timer}
          setQuestionErr={setQuestionErr}
          isMarkAsCorrectChecked={isMarkAsCorrectChecked}
          isSetTimerChecked={isSetTimerChecked}
          setTimerErr={setTimerErr}
          setCorrectAnswerErr={setCorrectAnswerErr}
          setMinOptionErr={setMinOptionErr}
          setOptionErr={setOptionErr}
        />
      </div>
    </div>
  );
};

export default CreatePoll;
