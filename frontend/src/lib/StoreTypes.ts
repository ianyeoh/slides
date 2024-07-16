import { z } from "zod";

/* =============== TYPES =============== */
// zod types, instantiated here so we can use z.parse() on getStore return data

// base type for a slide element's position
export const slideElementPosSchema = z.object({
    // the pos and rect size of a slide element is stored in proportions (0 - 100%) of the slide width/height
    // this is because the slide width and height can change if the window size changes, so we want to scale
    // the elements with the slide size
    width: z.number().gte(0).lte(1),
    height: z.number().gte(0).lte(1),
    x: z.number().gte(0).lte(1),
    y: z.number().gte(0).lte(1),
});
export type SlideElementPos = z.infer<typeof slideElementPosSchema>;

export const slideElementSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("text"),
        text: z.string(),
        fontSize: z.number(),
        fontFamily: z.string(),
        textColour: z.string(),
        pos: slideElementPosSchema,
    }),
    z.object({
        type: z.literal("image"),
        src: z.string(),
        alt: z.string(),
        pos: slideElementPosSchema,
    }),
    z.object({
        type: z.literal("video"),
        id: z.string(),
        auto: z.boolean(),
        pos: slideElementPosSchema,
    }),
    z.object({
        type: z.literal("code"),
        code: z.string(),
        fontSize: z.number(),
        pos: slideElementPosSchema,
    }),
]);
export type SlideElementSchema = z.infer<typeof slideElementSchema>;

export const slidesSchema = z.object({
    elements: z.array(slideElementSchema),
    theme: z.object({
        isGradient: z.boolean(),
        color: z.string(),
    }),
});
export type Slide = z.infer<typeof slidesSchema>;

export const presentationDataSchema = z.object({
    title: z.string(),
    thumbnail: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    slides: z.array(slidesSchema),
    lastEdited: z.string().datetime(),
    theme: z.object({
        isGradient: z.boolean(),
        color: z.string(),
    }),
});
export type PresentationData = z.infer<typeof presentationDataSchema>;

export const presentationVersion = z.object({
    data: presentationDataSchema,
    created: z.string().datetime(),
});
export type PresentationVersion = z.infer<typeof presentationVersion>;

export const presentationSchema = z.object({
    data: presentationDataSchema,
    versions: z.array(presentationVersion),
});
export type Presentation = z.infer<typeof presentationSchema>;

export const storeSchema = z.object({
    presentations: z.array(presentationSchema),
});
export type Store = z.infer<typeof storeSchema>;
