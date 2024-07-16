import { useStore } from "@/lib/StoreContext";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Clock9, Layers } from "lucide-react";
import { Link } from "@tanstack/react-router";
import TimeAgo from "react-timeago";

export function PresentationCardList() {
    const store = useStore();

    return (
        <>
            <h1 className="font-medium text-2xl">Your presentations</h1>
            {store.presentations.length === 0 ? (
                <p className="mt-5 col-auto font-light italic">
                    Click new presentation to create your first presentation.
                </p>
            ) : (
                <div className="mt-5 grid grid-cols-adaptive gap-3">
                    {store.presentations.map((presentation, index) => {
                        const pLink = `/dashboard/presentation/${index}/slide/0`;

                        return (
                            <Card
                                key={index}
                                className="p-4 transition duration-200 hover:drop-shadow-lg aspect-[2/1] min-w-[100px] min-h-[50px] max-h-[150px] max-w-[300px]"
                                data-cy={`presentationCardId-${index}`}
                            >
                                <Link to={pLink}>
                                    <div className="flex justify-between items-center h-full">
                                        <CardHeader className="p-0">
                                            <CardTitle>
                                                {presentation.data.title === ""
                                                    ? "Untitled presentation"
                                                    : presentation.data.title}
                                            </CardTitle>
                                            <CardDescription>
                                                {presentation.data.description}
                                            </CardDescription>
                                            <div className="flex gap-4 items-center font-light text-sm">
                                                <div className="flex gap-2 items-center">
                                                    <Clock9 width={12} />
                                                    <TimeAgo
                                                        date={
                                                            presentation.data
                                                                .lastEdited
                                                        }
                                                        formatter={(
                                                            value,
                                                            unit,
                                                            suffix
                                                        ) => {
                                                            if (
                                                                unit ===
                                                                "second"
                                                            ) {
                                                                return "Just now";
                                                            } else {
                                                                return `${value} ${unit}${value > 1 ? "s" : ""} ${suffix}`;
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex gap-2 items-center">
                                                    <Layers width={12} />
                                                    {
                                                        presentation.data.slides
                                                            .length
                                                    }
                                                </div>
                                            </div>
                                        </CardHeader>
                                        {presentation.data.thumbnail &&
                                        presentation.data.thumbnail !== "" ? (
                                            <img
                                                src={
                                                    presentation.data.thumbnail
                                                }
                                                className="aspect-square w-20 object-cover"
                                            />
                                        ) : (
                                            <div className="aspect-square bg-muted w-20"></div>
                                        )}
                                    </div>
                                </Link>
                            </Card>
                        );
                    })}
                </div>
            )}
        </>
    );
}
