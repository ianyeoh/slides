import { Store } from "./StoreTypes";

export function getPresentation(store: Store, index: number) {
    try {
        return store.presentations[index];
    } catch {
        return null;
    }
}

export function getSlide(
    store: Store,
    presentationIndex: number,
    slideIndex: number
) {
    try {
        return store.presentations[presentationIndex].data.slides[slideIndex];
    } catch {
        return null;
    }
}

export function getSlideElement(
    store: Store,
    presentationIndex: number,
    slideIndex: number,
    slideElementIndex: number
) {
    try {
        return store.presentations[presentationIndex].data.slides[slideIndex]
            .elements[slideElementIndex];
    } catch {
        return null;
    }
}

export function getPresentationVersion(store:Store, presentationIndex:number, versionIndex: number){
    try {
        return store.presentations[presentationIndex].versions[versionIndex]
    } catch {
        return null;
    }
}

// export function saveSlideChange(store: Store){
//     const storeCopy = structuredClone(store)

//     const addLatestVersion = () => {
//       storeCopy.versions.push({
//         presentations: structuredClone(store.presentations),
//         timestamp: new Date().toISOString(),
//       })
//     }
  
//     // First backup
//     if (store.versions.length === 0) {
//       addLatestVersion()
//     } else {
//       const latestVersion = store.versions[store.versions.length - 1]
//       // latest version is more than 1 min old -> add another version
//       if (new Date().getTime() - new Date(latestVersion.timestamp).getTime() > 60 * 1000) {
//         addLatestVersion()
//       }
//     }
// }
