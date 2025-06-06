import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";


export default function RightSheet({triggerName, title, description, variant, children}){

    return(
        <Sheet className="">
            <SheetTrigger asChild>
                <Button variant={variant ? variant : "default"}>{triggerName}</Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>
                        {title}
                    </SheetTitle>

                    <SheetDescription>
                        {description}
                    </SheetDescription>
                </SheetHeader>

                {children}

                <SheetFooter>

                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
