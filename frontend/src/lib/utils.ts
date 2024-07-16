import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function fileToDataUrl(file: File) {
    const validFileTypes = ["image/jpeg", "image/png", "image/jpg"];
    const valid = validFileTypes.find((type) => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error("provided file is not a png, jpg or jpeg image.");
    }

    const reader = new FileReader();
    const dataUrlPromise = new Promise<string>((resolve, reject) => {
        reader.onerror = reject;
        reader.onload = () => {
            if (reader.result) {
                resolve(reader.result.toString());
            } else {
                reject();
            }
        };
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

// https://stackoverflow.com/questions/3971841/how-to-resize-images-proportionally-keeping-the-aspect-ratio
export function calculateAspectRatioFit(
    srcWidth: number,
    srcHeight: number,
    maxWidth: number,
    maxHeight: number
): { width: number; height: number } {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth * ratio, height: srcHeight * ratio };
}
