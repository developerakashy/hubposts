import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { SiX } from "@icons-pack/react-simple-icons"
import { ChevronRight, PackageSearch, Plus, PlusCircle } from "lucide-react"

export default function NewDashboard(){

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <header className="h-16 flex shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1"/>
                    <Separator orientation="vertical" className="mr-2 h-4"/>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">
                                    Dashboard
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block"/>
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Create
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div
                            className="flex  gap-2 justify-center items-center p-4 rounded-xl bg-red-100/60"
                        >
                            <PackageSearch className="h-14 w-14 bg-white rounded-full border p-2"/>
                            <ChevronRight/>
                            <Plus className="h-24 w-24 p-2 rounded-full border bg-red-200 stroke-1 stroke-red-400"/>
                            <ChevronRight/>
                            <div className="h-14 w-14 bg-white flex items-center justify-center rounded">
                                 <SiX className="h-12 w-12 p-2  bg-white"/>
                            </div>
                        </div>

                        <div
                            className="aspect-video rounded-xl bg-muted/50"
                        ></div>

                        <div
                            className="aspect-video rounded-xl bg-muted/50"
                        ></div>
                    </div>

                    <div>
                        <p>Scheduled</p>
                    </div>

                    <div
                        className="min-h-[100vh] flex  rounded-xl bg-muted/50 md:min-h-min"
                    >
                        <div
                            className="border h-[250px] w-[450px]  rounded-xl bg-blue-200/50"
                        >
                            
                        </div>
                        <div
                            className="border h-[250px] w-[450px]  rounded-xl bg-blue-200/50"
                        ></div>
                    </div>

                    <div>
                        <p>Posted</p>
                    </div>

                    <div
                        className="min-h-[100vh] rounded-xl bg-muted/50 md:min-h-min"
                    >
                        <div
                            className="border h-[300px]  rounded-xl bg-blue-200/50"
                        ></div>
                    </div>
                </div>
            </SidebarInset>

        </SidebarProvider>
    )
}
