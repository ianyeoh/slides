import { useReducer } from "react";
import { Store } from "./StoreTypes";
import {
    createPresentation,
    createSlide,
    createSlideElement,
    deletePresentation,
    deleteSlide,
    deleteSlideElement,
    editPresentation,
    reorderSlide,
    resetStore,
    restoreVersion,
    saveStore,
    setStore,
    StoreAction,
    updateDefaultTheme,
    updateSlideElement,
    updateSlideElemPos,
    updateSlideTheme,
} from "./StoreActions";

// Why a useReducer? It allows us to place all of the store action code in one centralised
// location + each action represents a pure function that affects the store (aside from saveStore,
// which has the side-effect of saving the store to the backend), and updates the state across
// the entire application.

function reducer(store: Store, action: StoreAction): Store {
    switch (action.type) {
        // the case statements need to be string literals so typescript can understand the typing
        case "saveStore":
            saveStore(store, action.token, action.callback);
            return store;
        case "resetStore":
            return resetStore();
        case "setStore":
            return setStore(action.store);
        case "createPresentation":
            return createPresentation(store, action.title);
        case "deletePresentation":
            return deletePresentation(store, action.presentationIndex);
        case "editPresentation":
            return editPresentation(
                store,
                action.presentationIndex,
                action.presentation
            );
        case "updateDefaultTheme":
            return updateDefaultTheme(
                store,
                action.presentationIndex,
                action.theme
            );
        case "createSlide":
            return createSlide(store, action.presentationIndex);
        case "deleteSlide":
            return deleteSlide(
                store,
                action.presentationIndex,
                action.slideIndex
            );
        case "updateSlideTheme":
            return updateSlideTheme(
                store,
                action.presentationIndex,
                action.slideIndex,
                action.theme
            );
        case "createSlideElement":
            return createSlideElement(
                store,
                action.presentationIndex,
                action.slideIndex,
                action.element
            );
        case "deleteSlideElement":
            return deleteSlideElement(
                store,
                action.presentationIndex,
                action.slideIndex,
                action.slideElementIndex
            );
        case "reorderSlide":
            return reorderSlide(
                store,
                action.presentationIndex,
                action.slideIndex,
                action.newSlideIndex
            );
        case "updateSlideElement":
            return updateSlideElement(
                store,
                action.presentationIndex,
                action.slideIndex,
                action.elementIndex,
                action.element
            );
        case "updateSlideElemPos":
            return updateSlideElemPos(
                store,
                action.presentationIndex,
                action.slideIndex,
                action.slideElementIndex,
                action.newPos
            );
        case "restoreVersion":
            return restoreVersion(
                store,
                action.presentationIndex,
                action.versionIndex
            );
        default:
            throw new Error("Invalid store reducer action.");
    }
}

export const defaultStore = {
    presentations: [],
    // versions:[]
};

export function useStoreReducer(initialStore?: Store) {
    const [store, dispatch] = useReducer(reducer, initialStore ?? defaultStore);
    return { store, dispatch };
}
