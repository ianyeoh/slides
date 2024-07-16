import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useStore, useStoreUpdate } from "@/lib/StoreContext";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";

// Kinda helpful dev tools. Only displays if run with npm run dev
// Feel free to add more here
export function DevTools() {
    const store = useStore();
    const storeAction = useStoreUpdate();
    const token = useAuth();

    return (
        <>
            <h1 className="mt-10 font-medium text-2xl">Debug tools</h1>
            <div className="flex gap-3 items-center mt-5">
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button variant="outline">
                            View store state
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="absolute outline outline-2 outline-secondary p-5 mt-2 rounded-md">
                        <pre className="mt-4">
                            {JSON.stringify(store, null, 4)}
                        </pre>
                    </CollapsibleContent>
                </Collapsible>
                <Button
                    variant="destructive"
                    onClick={() => {
                        storeAction({ type: "resetStore" });
                        storeAction({
                            type: "saveStore",
                            token,
                            callback: (response) => {
                                if (response.success) {
                                    toast.success("Store reset successfully");
                                } else {
                                    toast.error(
                                        `Failed to reset store: ${response.error}`
                                    );
                                }
                            },
                        });
                    }}
                >
                    Reset store
                </Button>
            </div>
        </>
    );
}
