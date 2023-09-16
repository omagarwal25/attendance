import { Icon } from "@iconify-icon/react";
import { FC, useState } from "react";

type Props = {
  title: string;
  description: string;
  openButtonLabel: string;
  confirmButtonLabel: string;
  cancelButtonLabel: string;
  confirmButtonClass: string;
  onConfirm: () => void;
};

export const ConfirmationModal: FC<Props> = ({
  onConfirm,
  description,
  title,
  openButtonLabel,
  confirmButtonClass,
  confirmButtonLabel,
  cancelButtonLabel,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = () => {
    setShowModal(false);
    onConfirm();
  };
  return (
    <>
      <div className="flex items-center">
        <button
          className={`rounded-md p-3 ${confirmButtonClass}`}
          type="button"
          onClick={() => setShowModal(true)}
        >
          {openButtonLabel}
        </button>
      </div>
      {showModal && (
        <>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div
              className="fixed inset-0 h-full w-full bg-black opacity-40"
              onClick={() => setShowModal(false)}
            ></div>
            <div className="flex min-h-screen items-center py-8 px-4">
              <div className="relative mx-auto w-full max-w-lg rounded-md bg-white p-4 shadow-lg">
                <div className="mt-3 sm:flex">
                  <div className="mx-auto flex h-12 w-12 flex-none items-center justify-center rounded-full bg-red-100">
                    <Icon
                      icon="heroicons:exclamation-triangle-solid"
                      className="h-8 w-8 text-red-600"
                    />
                  </div>
                  <div className="mt-2 text-center sm:ml-4 sm:text-left">
                    <h1 className="text-lg font-medium text-gray-800">
                      {title}
                    </h1>
                    <p className="mt-2 text-[15px] leading-relaxed text-gray-500">
                      {description}
                    </p>
                    <div className="mt-3 items-center gap-2 sm:flex">
                      <button
                        className={`${confirmButtonClass} mt-2 w-full flex-1 rounded-md p-2.5 outline-none ring-red-600 ring-offset-2 focus:ring-2`}
                        onClick={handleConfirm}
                      >
                        {confirmButtonLabel}
                      </button>
                      <button
                        className="mt-2 w-full flex-1 rounded-md border p-2.5 text-gray-800 outline-none ring-indigo-600 ring-offset-2 focus:ring-2"
                        onClick={() => setShowModal(false)}
                      >
                        {cancelButtonLabel}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
