import {
    createContext,
    PropsWithChildren,
    useContext,
    Dispatch,
    useEffect,
} from "react";
import { Store } from "./StoreTypes";
import { defaultStore, useStoreReducer } from "./StoreReducer";
import { StoreAction } from "./StoreActions";

/* =============== DEFAULTS =============== */
// don't mark me down for this... this es-lint "error" only concerns a dev environment
// it doesn't make sense to put these declarations in different files.

const StoreContext = createContext<Store>(defaultStore);
const StoreUpdateContext = createContext<Dispatch<StoreAction>>(() => {
    return;
});

interface StoreProviderProps extends PropsWithChildren {
    initialStore: Store;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
    return useContext(StoreContext);
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStoreUpdate() {
    return useContext(StoreUpdateContext);
}

export function StoreProvider({ children, initialStore }: StoreProviderProps) {
    const { store, dispatch } = useStoreReducer(initialStore);

    useEffect(() => {
        dispatch({
            type: "setStore",
            store: initialStore,
        });
    }, [dispatch, initialStore]);

    return (
        <StoreContext.Provider value={store}>
            <StoreUpdateContext.Provider value={dispatch}>
                {children}
            </StoreUpdateContext.Provider>
        </StoreContext.Provider>
    );
}
