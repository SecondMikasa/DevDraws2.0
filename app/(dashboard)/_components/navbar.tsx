"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
    UserButton,
    OrganizationSwitcher,
    useOrganization
} from "@clerk/nextjs"

import { SearchInput } from "./sidebar/search-input"
import { InviteButton } from "./invite-button"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Star } from "lucide-react"

const Navbar = () => {

    const { organization } = useOrganization()
    const searchParams = useSearchParams()
    const favourites = searchParams.get("favourites")

    return (
        <div className="flex flex-col">
            {/* Main navbar */}
            <div className="flex items-center justify-between p-3 sm:p-4 lg:p-5 min-h-[60px] sm:min-h-[70px] lg:min-h-[80px]">
                {/* Left side - Search on desktop, Org switcher on mobile */}
                <div className="flex items-center">
                    <div className="hidden lg:block w-80">
                        <SearchInput />
                    </div>
                    <div className="block lg:hidden max-w-xs">
                        <OrganizationSwitcher
                            hidePersonal
                            appearance={{
                                elements: {
                                    rootBox: {
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        alignItems: "center",
                                        width: "100%"
                                    },
                                    organizationSwitcherTrigger: {
                                        padding: "8px 12px",
                                        width: "100%",
                                        borderRadius: "8px",
                                        border: "1px solid #E5E7EB",
                                        minHeight: "44px"
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Right side - Invite button and User button */}
                <div className="flex items-center gap-x-2 sm:gap-x-3">
                    {organization && (
                        <div className="hidden sm:block">
                            <InviteButton />
                        </div>
                    )}
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10"
                            }
                        }}
                    />
                </div>
            </div>

            {/* Mobile Search */}
            <div className="block lg:hidden px-3 sm:px-4 pb-3">
                <SearchInput />
            </div>

            {/* Mobile Navigation Tabs */}
            <div className="flex lg:hidden border-b border-gray-200 px-3 sm:px-4">
                <div className="flex space-x-1 w-full">
                    <Button
                        variant={favourites ? "ghost" : "secondary"}
                        asChild
                        size="sm"
                        className="font-normal justify-center flex-1 px-3 py-2 min-h-[44px] text-sm"
                    >
                        <Link href="/">
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Team Boards
                        </Link>
                    </Button>
                    <Button
                        variant={favourites ? "secondary" : "ghost"}
                        asChild
                        size="sm"
                        className="font-normal justify-center flex-1 px-3 py-2 min-h-[44px] text-sm"
                    >
                        <Link href={{
                            pathname: "/",
                            query: { favourites: true }
                        }}>
                            <Star className="h-4 w-4 mr-2" />
                            Favourites
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Navbar