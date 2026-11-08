import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
}) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    return (
        <Transition show={show} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                className="fixed inset-0 z-[1600] flex items-end justify-center sm:items-center sm:p-4"
                onClose={close}
            >
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-olive-950/55 backdrop-blur-[2px]" />
                </TransitionChild>

                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="translate-y-full sm:translate-y-4 sm:opacity-0 sm:scale-95"
                    enterTo="translate-y-0 sm:opacity-100 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="translate-y-0 sm:opacity-100 sm:scale-100"
                    leaveTo="translate-y-full sm:translate-y-4 sm:opacity-0 sm:scale-95"
                >
                    <DialogPanel
                        className={`relative max-h-[min(92dvh,920px)] w-full transform overflow-y-auto rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-xl transition-all dark:bg-olive-900 dark:shadow-none dark:ring-1 dark:ring-olive-800 sm:max-h-[90vh] sm:rounded-2xl sm:pb-0 sm:w-full ${maxWidthClass}`}
                    >
                        {children}
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
