import { APIReturn, putStore } from "./api";
import {
    getPresentation,
    getPresentationVersion,
    getSlide,
    getSlideElement,
} from "./StoreHelpers";
import { defaultStore } from "./StoreReducer";
import {
    Store,
    Presentation,
    SlideElementPos,
    SlideElementSchema,
    Slide,
    PresentationData,
} from "./StoreTypes";
import { arrayMoveMutable } from "array-move";

const getInitialSlide = () => {
    const initialSlide: Slide = {
        elements: [],
        theme: {
            isGradient: false,
            color: "",
        },
    };
    return structuredClone(initialSlide);
};

const checkAndAddVersion = (store: Store, presentationIndex: number) => {
    store.presentations[presentationIndex].data.lastEdited =
        new Date().toISOString();

    const addLatestVersion = () => {
        store.presentations[presentationIndex].versions.unshift({
            data: structuredClone(store.presentations[presentationIndex].data),
            created: new Date().toISOString(),
        });
    };

    if (store.presentations[presentationIndex].versions.length === 0) {
        addLatestVersion();
    } else {
        const latestVersion =
            store.presentations[presentationIndex].versions[0];
        // latest version is more than 1 min old -> add another version
        if (
            new Date().getTime() - new Date(latestVersion.created).getTime() >
            60 * 1000
        ) {
            addLatestVersion();
        }
    }
};

/* =============== STORE ACTIONS =============== */
// These are functions used in the store reducer hook - basically all the
// possible actions that we can do to the store in our app.
//
// These functions come with an associated type for the function args
// which allows us to strongly type the reducer function
//
// !! IMPORTANT !!
// Avoid mutating the store object!! Instead clone the object and any
// changed properties, and return the cloned object.

// Save the store back to the backend. This one is kind of a hack.
// To track the completion of the async backend request, pass in a
// callback, which is called with the return value of putStore as
// an arg.
type StoreSave = {
    type: "saveStore";
    token: string;
    callback: (request: APIReturn) => void;
};
export function saveStore(
    store: Store,
    token: string,
    callback: (request: APIReturn) => void
): void {
    putStore(token, store).then(callback);
}

// Reset the store
type StoreReset = {
    type: "resetStore";
};
export function resetStore(): Store {
    return structuredClone(defaultStore);
}

// Set the entire store
type StoreSet = {
    type: "setStore";
    store: Store;
};
export function setStore(store: Store): Store {
    return structuredClone(store);
}

// Create a presentation
type StoreCreatePresentation = {
    type: "createPresentation";
    title: string;
};
export function createPresentation(store: Store, title: string): Store {
    const storeCopy = structuredClone(store);

    const newPresentationData: PresentationData = {
        title,
        slides: [getInitialSlide()],
        lastEdited: new Date().toISOString(),
        theme: {
            color: "#fefbfe",
            isGradient: false,
        },
    };

    storeCopy.presentations.push({ data: newPresentationData, versions: [] });
    return storeCopy;
}

// Delete a presentation
type StoreDeletePresentation = {
    type: "deletePresentation";
    presentationIndex: number;
};
export function deletePresentation(
    store: Store,
    presentationIndex: number
): Store {
    const storeCopy = structuredClone(store);

    if (!getPresentation(store, presentationIndex)) {
        throw new Error("Presentation does not exist.");
    }

    storeCopy.presentations = [...store.presentations];
    storeCopy.presentations.splice(presentationIndex, 1);

    return storeCopy;
}

// Edit a presentation
type StoreEditPresentation = {
    type: "editPresentation";
    presentationIndex: number;
    presentation: Presentation;
};
export function editPresentation(
    store: Store,
    presentationIndex: number,
    presentation: Presentation
): Store {
    const storeCopy: Store = structuredClone(store);

    if (!getPresentation(store, presentationIndex)) {
        throw new Error("Presentation does not exist.");
    }

    storeCopy.presentations[presentationIndex] = structuredClone(presentation);
    checkAndAddVersion(storeCopy, presentationIndex);

    return storeCopy;
}

type StoreUpdateDefaultTheme = {
    type: "updateDefaultTheme";
    presentationIndex: number;
    theme: {
        color: string;
        isGradient: boolean;
    };
};
export function updateDefaultTheme(
    store: Store,
    presentationIndex: number,
    theme: { color: string; isGradient: boolean }
) {
    if (!getPresentation(store, presentationIndex)) {
        throw new Error("Presentation does not exist.");
    }
    const storeCopy = structuredClone(store);
    storeCopy.presentations[presentationIndex].data.theme = { ...theme };
    checkAndAddVersion(storeCopy, presentationIndex);
    return storeCopy;
}

type StoreCreateSlide = {
    type: "createSlide";
    presentationIndex: number;
};
export function createSlide(store: Store, presentationIndex: number): Store {
    const storeCopy = structuredClone(store);

    if (!getPresentation(store, presentationIndex)) {
        throw new Error("Presentation does not exist.");
    }

    storeCopy.presentations[presentationIndex].data.slides.push(
        getInitialSlide()
    );
    checkAndAddVersion(storeCopy, presentationIndex);

    return storeCopy;
}

type StoreDeleteSlide = {
    type: "deleteSlide";
    presentationIndex: number;
    slideIndex: number;
};
export function deleteSlide(
    store: Store,
    presentationIndex: number,
    slideIndex: number
): Store {
    const storeCopy: Store = structuredClone(store);

    if (!getSlide(store, presentationIndex, slideIndex)) {
        throw new Error("Presentation does not exist.");
    }

    storeCopy.presentations[presentationIndex].data.slides.splice(
        slideIndex,
        1
    );
    checkAndAddVersion(storeCopy, presentationIndex);
    return storeCopy;
}

type StoreReorderSlide = {
    type: "reorderSlide";
    presentationIndex: number;
    slideIndex: number;
    newSlideIndex: number;
};
export function reorderSlide(
    store: Store,
    presentationIndex: number,
    slideIndex: number,
    newSlideIndex: number
): Store {
    const storeCopy: Store = structuredClone(store);

    const presentation = getPresentation(store, presentationIndex);

    if (!presentation) {
        throw new Error("Invalid presentation index");
    }

    if (
        !getSlide(store, presentationIndex, slideIndex) ||
        newSlideIndex < 0 ||
        newSlideIndex > presentation.data.slides.length ||
        slideIndex === newSlideIndex
    ) {
        throw new Error("Invalid source slide index");
    }

    // too ceebs writing this myself
    arrayMoveMutable(
        storeCopy.presentations[presentationIndex].data.slides,
        slideIndex,
        newSlideIndex
    );
    checkAndAddVersion(storeCopy, presentationIndex);
    return storeCopy;
}

type StoreUpdateSlideTheme = {
    type: "updateSlideTheme";
    presentationIndex: number;
    slideIndex: number;
    theme: {
        color: string;
        isGradient: boolean;
    };
};
export function updateSlideTheme(
    store: Store,
    presentationIndex: number,
    slideIndex: number,
    theme: { color: string; isGradient: boolean }
) {
    if (!getSlide(store, presentationIndex, slideIndex)) {
        throw new Error("Presentation does not exist.");
    }
    const storeCopy = structuredClone(store);
    storeCopy.presentations[presentationIndex].data.slides[slideIndex].theme = {
        ...theme,
    };
    checkAndAddVersion(storeCopy, presentationIndex);
    return storeCopy;
}

type StoreCreateSlideElement = {
    type: "createSlideElement";
    presentationIndex: number;
    slideIndex: number;
    element: SlideElementSchema;
};
export function createSlideElement(
    store: Store,
    presentationIndex: number,
    slideIndex: number,
    element: SlideElementSchema
) {
    if (!getSlide(store, presentationIndex, slideIndex)) {
        throw new Error("Slide does not exist");
    }
    const storeCopy = structuredClone(store);

    storeCopy.presentations[presentationIndex].data.slides[
        slideIndex
    ].elements.push(element);
    checkAndAddVersion(storeCopy, presentationIndex);
    return storeCopy;
}

type StoreDeleteSlideElement = {
    type: "deleteSlideElement";
    presentationIndex: number;
    slideIndex: number;
    slideElementIndex: number;
};
export function deleteSlideElement(
    store: Store,
    presentationIndex: number,
    slideIndex: number,
    slideElementIndex: number
) {
    if (
        !getSlideElement(
            store,
            presentationIndex,
            slideIndex,
            slideElementIndex
        )
    ) {
        throw new Error("Slide element does not exist");
    }
    const storeCopy = structuredClone(store);

    storeCopy.presentations[presentationIndex].data.slides[
        slideIndex
    ].elements.splice(slideElementIndex, 1);
    checkAndAddVersion(storeCopy, presentationIndex);
    return storeCopy;
}

type StoreUpdateSlideElement = {
    type: "updateSlideElement";
    presentationIndex: number;
    slideIndex: number;
    elementIndex: number;
    element: SlideElementSchema;
};
export function updateSlideElement(
    store: Store,
    presentationIndex: number,
    slideIndex: number,
    elementIndex: number,
    element: SlideElementSchema
) {
    if (!getSlideElement(store, presentationIndex, slideIndex, elementIndex)) {
        throw new Error("Slide element does not exist");
    }
    const storeCopy = structuredClone(store);
    storeCopy.presentations[presentationIndex].data.slides[slideIndex].elements[
        elementIndex
    ] = element;
    checkAndAddVersion(storeCopy, presentationIndex);
    return storeCopy;
}

type StoreUpdateSlideElemPos = {
    type: "updateSlideElemPos";
    presentationIndex: number;
    slideIndex: number;
    slideElementIndex: number;
    newPos: SlideElementPos;
};
export function updateSlideElemPos(
    store: Store,
    presentationIndex: number,
    slideIndex: number,
    slideElementIndex: number,
    newPos: SlideElementPos
) {
    const storeCopy = structuredClone(store);

    if (
        !getSlideElement(
            store,
            presentationIndex,
            slideIndex,
            slideElementIndex
        )
    ) {
        throw new Error("Slide element does not exist");
    }

    storeCopy.presentations[presentationIndex].data.slides[slideIndex].elements[
        slideElementIndex
    ].pos = newPos;
    checkAndAddVersion(storeCopy, presentationIndex);
    return storeCopy;
}

type StoreRestoreVersion = {
    type: "restoreVersion";
    presentationIndex: number;
    versionIndex: number;
};
export function restoreVersion(
    store: Store,
    presentationIndex: number,
    versionIndex: number
) {
    const storeCopy = structuredClone(store);

    if (!getPresentation(store, presentationIndex)) {
        throw new Error("Slide element does not exist");
    }

    if (!getPresentationVersion(store, presentationIndex, versionIndex)) {
        throw new Error("Slide element does not exist");
    }

    storeCopy.presentations[presentationIndex].data = structuredClone(
        storeCopy.presentations[presentationIndex].versions[versionIndex].data
    );
    return storeCopy;
}

// ungodly union type which will definitely grow to be 20 lines long... (yuck)
export type StoreAction =
    | StoreSave
    | StoreReset
    | StoreSet
    | StoreCreatePresentation
    | StoreEditPresentation
    | StoreDeletePresentation
    | StoreCreateSlide
    | StoreDeleteSlide
    | StoreReorderSlide
    | StoreCreateSlideElement
    | StoreUpdateSlideElement
    | StoreUpdateSlideElemPos
    | StoreDeleteSlideElement
    | StoreUpdateDefaultTheme
    | StoreUpdateSlideTheme
    | StoreRestoreVersion;
