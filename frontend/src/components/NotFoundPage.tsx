import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";

export function NotFoundPage() {
    document.title = "Page Not Found";
    const { history } = useRouter();

    return (
        <div className="flex justify-center items-center h-screen">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Page Not Found</CardTitle>
                    <CardDescription>
                        The page you are looking for isn't available.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex">
                    <Button className="ml-auto" onClick={() => history.go(-1)}>
                        Go back
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
