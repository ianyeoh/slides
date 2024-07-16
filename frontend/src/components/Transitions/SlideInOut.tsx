import { useEffect, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { Slide } from "../Slide";
import { cn } from "@/lib/utils";

const enterFromLeft = {
    from: {
        x: -window.innerWidth,
    },
    to: {
        x: 0,
    },
};

const enterFromRight = {
    from: {
        x: window.innerWidth,
    },
    to: {
        x: 0,
    },
};

const exitToLeft = {
    from: {
        x: 0,
    },
    to: {
        x: -window.innerWidth,
    },
};

const exitToRight = {
    from: {
        x: 0,
    },
    to: {
        x: window.innerWidth,
    },
};

export function SlideInOutTransition({
    presentationIndex,
    prevSlideIndex,
    nextSlideIndex,
}: {
    presentationIndex: number;
    prevSlideIndex: number;
    nextSlideIndex: number;
}) {
    const [prevSlideSprings, prevSlideApi] = useSpring(() => ({
        onStart: () => {
            setHidePrevSlide(false);
        },
        onRest: () => {
            setHidePrevSlide(true);
        },
    }));
    const [nextSlideSprings, nextSlideApi] = useSpring(() => ({}));
    const [hidePrevSlide, setHidePrevSlide] = useState<boolean>(false);

    useEffect(() => {
        if (nextSlideIndex > prevSlideIndex) {
            prevSlideApi.start(exitToLeft);
            nextSlideApi.start(enterFromRight);
        } else {
            prevSlideApi.start(exitToRight);
            nextSlideApi.start(enterFromLeft);
        }
    }, [prevSlideIndex, nextSlideIndex, prevSlideApi, nextSlideApi]);

    return (
        <>
            <animated.div
                className={cn(
                    "top-0 left-0 w-full",
                    hidePrevSlide ? "hidden" : "absolute"
                )}
                style={{ ...prevSlideSprings }}
            >
                <Slide
                    presentationIndex={presentationIndex}
                    slideIndex={prevSlideIndex}
                    isDisabled={true}
                />
            </animated.div>
            <animated.div
                className="absolute top-0 left-0 w-full"
                style={{ ...nextSlideSprings }}
            >
                <Slide
                    presentationIndex={presentationIndex}
                    slideIndex={nextSlideIndex}
                    isDisabled={true}
                />
            </animated.div>
        </>
    );
}
