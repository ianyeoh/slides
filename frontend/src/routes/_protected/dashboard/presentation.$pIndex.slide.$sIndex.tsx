import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_protected/dashboard/presentation/$pIndex/slide/$sIndex"
)({
    component: () => (
        <HotkeysProvider initiallyActiveScopes={["slide"]}>
            <PresentationPage />
        </HotkeysProvider>
    ),
});

import { useStore } from "@/lib/StoreContext";
import { NotFoundPage } from "@/components/NotFoundPage";
import { DeletePresentationButton } from "@/components/DeletePresentationBtn";
import { Slide } from "@/components/Slide";
import CreateSlideBtn from "@/components/CreateSlideBtn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DeleteSlideBtn from "@/components/DeleteSlideBtn";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { PresentationMenubar } from "@/components/PresentationMenubar";
import { EditPresentationTitleBtn } from "@/components/EditPresentationBtn";
import { HotkeysProvider, useHotkeys } from "react-hotkeys-hook";
import { SlideOrderPanel } from "@/components/SlideOrderPanel/SlideOrderPanel";
import { getPresentation, getSlide } from "@/lib/StoreHelpers";

function PresentationPage() {
    const store = useStore();
    const params = Route.useParams();
    const navigate = Route.useNavigate();

    const presentationIndex = Number(params.pIndex);
    const slideIndex = Number(params.sIndex);

    useHotkeys(
        ["LeftArrow", "RightArrow"],
        (e) => {
            if (e.repeat) {
                return;
            }

            // only allow keyboard controls if no element is active
            if (!(document.activeElement === document.body)) {
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

    const presentation = getPresentation(store, presentationIndex);

    if (!presentation) {
        return <NotFoundPage />;
    }

    const slide = getSlide(store, presentationIndex, slideIndex);

    if (!slide) {
        const lastSlideIndex = presentation.data.slides.length - 1;
        navigate({
            to: "/dashboard/presentation/$pIndex/slide/$sIndex",
            params: {
                pIndex: presentationIndex.toString(),
                sIndex: lastSlideIndex.toString(),
            },
        });
    }

    document.title = `Edit: ${presentation.data.title === "" ? "Untitled presentation" : presentation.data.title}`;

    const handlePrevSlide = (
        e: KeyboardEvent | React.MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();
        if (slideIndex > 0) {
            navigate({
                to: `/dashboard/presentation/$pIndex/slide/$sIndex`,
                params: {
                    pIndex: presentationIndex.toString(),
                    sIndex: (slideIndex - 1).toString(),
                },
            });
        }
    };

    const handleNextSlide = (
        e: KeyboardEvent | React.MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();
        if (
            slideIndex <
            store.presentations[presentationIndex].data.slides.length - 1
        ) {
            navigate({
                to: `/dashboard/presentation/$pIndex/slide/$sIndex`,
                params: {
                    pIndex: presentationIndex.toString(),
                    sIndex: (slideIndex + 1).toString(),
                },
            });
        }
    };

    const navigateToSlide0 = () => {
        navigate({
            to: `/dashboard/presentation/$pIndex/slide/$sIndex`,
            params: {
                pIndex: presentationIndex.toString(),
                sIndex: "0",
            },
        });
    };

    return (
        <div className="flex flex-col h-screen min-w-[300px]">
            {/* NavBar, top of page */}
            <div className="flex gap-4 px-8 py-3 items-center h-[8vh]">
                <div className="flex gap-3">
                    <span className="font-semibold text-lg">
                        {presentation.data.title}
                    </span>
                    <EditPresentationTitleBtn
                        presentationIndex={presentationIndex}
                    />
                </div>

                <Link
                    to="/dashboard"
                    className="ml-auto"
                    data-cy="backToDashboard"
                >
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="rounded-md p-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                    <ChevronLeft />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Back to dashboard</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Link>
                <DeletePresentationButton
                    presentationIndex={presentationIndex}
                />
            </div>

            {/* Presentation Menubar, directly underneath the NavBar */}
            <div className="h-[5vh]">
                <PresentationMenubar
                    presentationIndex={presentationIndex}
                    slideIndex={slideIndex}
                    navigateToSlide0={navigateToSlide0}
                />
            </div>

            <div className="flex-grow bg-muted px-3 pb-4 grid grid-cols-10 h-[87vh]">
                <div className="col-span-2 h-full">
                    <SlideOrderPanel
                        presentationIndex={presentationIndex}
                        selectedSlide={slideIndex}
                    />
                </div>
                <div className="col-span-6 flex flex-col justify-center h-full">
                    <Slide
                        slideIndex={slideIndex}
                        presentationIndex={presentationIndex}
                        isDisabled={false}
                        isThumbnail={false}
                    />
                </div>
                <div className="col-span-2 flex justify-end mr-5 h-full">
                    <div className="flex flex-col justify-between">
                        <DeleteSlideBtn
                            presentationIndex={presentationIndex}
                            slideIndex={slideIndex}
                            onSlideDelete={(newSlide) => {
                                navigate({
                                    to: "/dashboard/presentation/$pIndex/slide/$sIndex",
                                    params: {
                                        pIndex: presentationIndex.toString(),
                                        sIndex: newSlide.toString(),
                                    },
                                });
                            }}
                        />
                        <CreateSlideBtn presentationIndex={presentationIndex} />
                        <div className="grid grid-cols-2 mb-4">
                            {slideIndex > 0 ? (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger
                                            onClick={handlePrevSlide}
                                            data-cy="prevSlideBtn"
                                        >
                                            <ChevronLeft className="w-10 h-10 hover:cursor-pointer" />
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
                            {slideIndex <
                                store.presentations[presentationIndex].data
                                    .slides.length -
                                    1 && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger
                                            onClick={handleNextSlide}
                                            data-cy="nextSlideBtn"
                                        >
                                            <ChevronRight className="w-10 h-10 hover:cursor-pointer" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Next slide</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
