import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

const ConfirmBox = ({
  successText,
  rejectText,
  onSuccess,
  open,
  onReject,
  title,
  subTitle,
  subTitleColor,
}) => {
  return (
    <>
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" onClose={() => {}}>
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

          <div>
            <div>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel>
                  <Dialog.Title>{title}</Dialog.Title>
                  <div>
                    <p
                      style={{
                        color: subTitleColor ? subTitleColor : "#9FA0A7",
                      }}
                    >
                      {subTitle}
                    </p>
                  </div>

                  <div>
                    {rejectText && (
                      <button type="button" onClick={onReject}>
                        {rejectText}
                      </button>
                    )}
                    <button type="button" onClick={onSuccess}>
                      {successText}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ConfirmBox;
