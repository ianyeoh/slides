import { SlideInOutTransition } from "@/components/Transitions/SlideInOut";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStore } from "@/lib/StoreContext";
import { calculateAspectRatioFit } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useMeasure } from "@uidotdev/usehooks";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export const Route = createFileRoute(
    "/_protected/dashboard/presentation/$pIndex/slide/$sIndex/present"
)({
    component: () => <FullscreenPresentation />,
});

function FullscreenPresentation() {
    const store = useStore();
    const params = Route.useParams();
    const navigate = Route.useNavigate();

    const [ref, { width, height }] = useMeasure();

    const presentationIndex = Number(params.pIndex);
    const curSlideIndex = Number(params.sIndex);
    const [prevSlideIndex, setPrevSlideIndex] = useState<number>(0);

    useHotkeys(
        ["LeftArrow", "RightArrow"],
        (e) => {
            if (e.repeat) {
                return;
            }
            if (e.key === "ArrowLeft") {
                handlePrevSlide(e);
            } else {
                handleNextSlide(e);
            }
        },
        { keydown: true }
    );

    const handlePrevSlide = (
        e: KeyboardEvent | React.MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();
        if (curSlideIndex > 0) {
            setPrevSlideIndex(curSlideIndex);
            navigate({
                to: `/dashboard/presentation/$pIndex/slide/$sIndex/present`,
                params: {
                    pIndex: presentationIndex.toString(),
                    sIndex: (curSlideIndex - 1).toString(),
                },
            });
        }
    };

    const handleNextSlide = (
        e: KeyboardEvent | React.MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();
        if (
            curSlideIndex <
            store.presentations[presentationIndex].data.slides.length - 1
        ) {
            setPrevSlideIndex(curSlideIndex);
            navigate({
                to: `/dashboard/presentation/$pIndex/slide/$sIndex/present`,
                params: {
                    pIndex: presentationIndex.toString(),
                    sIndex: (curSlideIndex + 1).toString(),
                },
            });
        }
    };

    return (
        <div ref={ref} className="h-dvh w-full flex bg-black relative">
            {width && height && (
                <div
                    style={calculateAspectRatioFit(16, 9, width, height)}
                    className="m-auto relative"
                >
                    <SlideInOutTransition
                        presentationIndex={presentationIndex}
                        prevSlideIndex={prevSlideIndex}
                        nextSlideIndex={curSlideIndex}
                    />
                </div>
            )}

            <span className="fixed bottom-2 right-10 text-sm select-none text-slate-500">
                <div className="grid grid-cols-2 mb-4">
                    {curSlideIndex > 0 ? (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger onClick={handlePrevSlide}>
                                    <ChevronLeft className="w-20 h-20 hover:cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Previous slide</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : (
                        // the empty div fills the left column so the right arrow never falls into the left slot
                        <div></div>
                    )}
                    {curSlideIndex <
                        store.presentations[presentationIndex].data.slides
                            .length -
                            1 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger onClick={handleNextSlide}>
                                    <ChevronRight className="w-20 h-20 hover:cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Next slide</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </span>
        </div>
    );
}
