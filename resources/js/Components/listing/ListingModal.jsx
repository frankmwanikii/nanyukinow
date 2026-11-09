import {
    AnimatePresence,
    motion,
    useAnimation,
    useDragControls,
    useReducedMotion,
} from 'framer-motion';
import { useEffect, useState } from 'react';
import CloseButton from '@/Components/site/CloseButton';

const SNAP_COMPACT = '72dvh';
const SNAP_EXPANDED = '92dvh';

function useIsMobileSheet() {
    const [mobile, setMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 639px)');
        const update = () => setMobile(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    return mobile;
}

export default function ListingModal({
    open,
    onClose,
    title,
    children,
    wide = false,
}) {
    const isMobile = useIsMobileSheet();
    const reduceMotion = useReducedMotion();
    const dragControls = useDragControls();
    const panelControls = useAnimation();
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        setExpanded(true);
        const onKey = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    useEffect(() => {
        if (!open || !isMobile) {
            return;
        }
        panelControls.start({
            y: 0,
            height: expanded ? SNAP_EXPANDED : SNAP_COMPACT,
            transition: reduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 420, damping: 36, mass: 0.85 },
        });
    }, [open, isMobile, expanded, panelControls, reduceMotion]);

    const finishClose = async () => {
        if (isMobile && !reduceMotion) {
            await panelControls.start({
                y: '110%',
                transition: { type: 'spring', stiffness: 380, damping: 40 },
            });
        }
        onClose();
    };

    const onDragEnd = (_event, info) => {
        if (!isMobile) {
            return;
        }

        const { offset, velocity } = info;
        const shouldClose = offset.y > 140 || velocity.y > 900;
        if (shouldClose) {
            finishClose();
            return;
        }

        const nextExpanded =
            offset.y < -48 || velocity.y < -450
                ? true
                : offset.y > 56 && expanded
                  ? false
                  : expanded;

        if (nextExpanded !== expanded) {
            setExpanded(nextExpanded);
        }

        panelControls.start({
            y: 0,
            height: nextExpanded ? SNAP_EXPANDED : SNAP_COMPACT,
            transition: reduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 460, damping: 38, mass: 0.8 },
        });
    };

    return (
        <AnimatePresence>
            {open ? (
                <div
                    className="fixed inset-0 z-[1200] flex items-end justify-center p-0 sm:items-center sm:p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label={title}
                >
                    <motion.button
                        type="button"
                        aria-label="Dismiss"
                        className="absolute inset-0 bg-earth-dusk/55 backdrop-blur-[2px]"
                        initial={
                            reduceMotion ? false : { opacity: 0 }
                        }
                        animate={{ opacity: 1 }}
                        exit={reduceMotion ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        onClick={finishClose}
                    />

                    <motion.div
                        className={`relative flex w-full flex-col bg-white shadow-lift sm:max-h-[90vh] sm:overflow-hidden sm:rounded-2xl ${
                            wide ? 'sm:max-w-2xl' : 'sm:max-w-md'
                        } ${
                            isMobile
                                ? 'overflow-hidden rounded-t-2xl pb-[env(safe-area-inset-bottom)]'
                                : ''
                        }`}
                        style={
                            isMobile
                                ? { maxHeight: SNAP_EXPANDED }
                                : undefined
                        }
                        initial={
                            reduceMotion
                                ? false
                                : isMobile
                                  ? { y: '110%', height: SNAP_EXPANDED }
                                  : { opacity: 0, scale: 0.98, y: 12 }
                        }
                        animate={
                            isMobile
                                ? panelControls
                                : {
                                      opacity: 1,
                                      scale: 1,
                                      y: 0,
                                      transition: {
                                          type: 'spring',
                                          stiffness: 420,
                                          damping: 34,
                                      },
                                  }
                        }
                        exit={
                            reduceMotion
                                ? undefined
                                : isMobile
                                  ? {
                                        y: '110%',
                                        transition: {
                                            type: 'spring',
                                            stiffness: 380,
                                            damping: 40,
                                        },
                                    }
                                  : {
                                        opacity: 0,
                                        scale: 0.98,
                                        y: 12,
                                        transition: { duration: 0.16 },
                                    }
                        }
                        drag={isMobile ? 'y' : false}
                        dragControls={dragControls}
                        dragListener={false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0.08, bottom: 0.62 }}
                        dragTransition={{
                            bounceStiffness: 520,
                            bounceDamping: 32,
                        }}
                        onDragEnd={onDragEnd}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isMobile ? (
                            <div
                                className="flex shrink-0 cursor-grab touch-none flex-col items-center pt-2 active:cursor-grabbing"
                                onPointerDown={(e) =>
                                    dragControls.start(e)
                                }
                            >
                                <span
                                    className="mb-1 h-1.5 w-11 rounded-full bg-olive-300"
                                    aria-hidden="true"
                                />
                                <span className="sr-only">
                                    Drag to resize or close
                                </span>
                            </div>
                        ) : null}

                        <div
                            className={`sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-olive-100 bg-white px-5 ${
                                isMobile ? 'py-3' : 'py-4'
                            }`}
                            onPointerDown={(e) => {
                                if (!isMobile) {
                                    return;
                                }
                                // Allow dragging from the header, but not the close button.
                                if (
                                    e.target instanceof Element &&
                                    e.target.closest('button')
                                ) {
                                    return;
                                }
                                dragControls.start(e);
                            }}
                        >
                            <h2 className="font-display text-lg font-semibold text-earth-dusk">
                                {title}
                            </h2>
                            <CloseButton onClick={finishClose} />
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
                            {children}
                        </div>
                    </motion.div>
                </div>
            ) : null}
        </AnimatePresence>
    );
}
