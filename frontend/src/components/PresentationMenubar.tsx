import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/menubar";
import { useStore } from "@/lib/StoreContext";
import { getPresentation } from "@/lib/StoreHelpers";
import { CreateTextModal } from "@/components/SlideElementModals/CreateTextModal";
import { CreateImageModal } from "@/components/SlideElementModals/CreateImageModal";
import { CreateVideoModal } from "./SlideElementModals/CreateVideoModal";
import { CreateCodeModal } from "./SlideElementModals/CreateCodeModal";
import { ThemeModal } from "./ThemeModal";
import { Presentation } from "lucide-react";
import { HistoryModal } from "./HistoryModal";

export function PresentationMenubar({
    presentationIndex,
    slideIndex,
    navigateToSlide0,
}: {
    presentationIndex: number;
    slideIndex: number;
    navigateToSlide0: () => void;
}) {
    const store = useStore();
    // Check presentation index
    if (!getPresentation(store, presentationIndex)) {
        throw new Error("Invalid presentation index");
    }

    return (
        <Menubar className="px-8 rounded-none">
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem
                        className="gap-2"
                        onClick={() =>
                            window.open(`${window.location.href}/present`)
                        }
                    >
                        <Presentation width={15} />
                        Present
                    </MenubarItem>
                    <MenubarSeparator />
                    <HistoryModal
                        presentationIndex={presentationIndex}
                        navigateToSlide0={navigateToSlide0}
                    />
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <ThemeModal
                        presentationIndex={presentationIndex}
                        slideIndex={slideIndex}
                    />
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger data-cy="insertElement">Insert</MenubarTrigger>
                <MenubarContent>
                    <CreateTextModal
                        slideIndex={slideIndex}
                        presentationIndex={presentationIndex}
                    />
                    <CreateImageModal
                        slideIndex={slideIndex}
                        presentationIndex={presentationIndex}
                    />
                    <CreateVideoModal
                        slideIndex={slideIndex}
                        presentationIndex={presentationIndex}
                    />
                    <CreateCodeModal
                        slideIndex={slideIndex}
                        presentationIndex={presentationIndex}
                    />
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    );
}
