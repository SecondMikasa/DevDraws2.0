"use client"
import {
    ChangeEvent,
    useEffect,
    useState
} from "react"

import { useRouter } from "next/navigation";

import qs from "query-string";
import { Search } from "lucide-react";
import { useDebounceValue } from "usehooks-ts";

import { Input } from "@/components/ui/input";

export const SearchInput = () => {

    const router = useRouter()
    const [value, setValue] = useState("")
    const debouncedValue = useDebounceValue(value, 500);

    //debouncedValue returns an array of debounced value and the function to update it
    const stringValue = debouncedValue[0];

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
    }

    useEffect(() => {
        const url = qs.stringifyUrl({
            url: "/",
            query: {
                search: stringValue
            },
        }, {
            skipEmptyString: true,
            skipNull: true
        })

        router.push(url)

    }, [stringValue, router]);

    return (
        <div className="w-full relative">
            <Search
                className="absolute top-1/2 left-4 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10 pointer-events-none"
            />
            <Input
                className="w-full !pl-12 pr-4"
                placeholder="Search Through Boards"
                onChange={handleChange}
                value={value}
            />
        </div>
    )
}
