import { useEffect } from "react";

export const useDisableScrollBounce = () => {

    useEffect(() => {
        // on element mount
        document.body.classList.add("overflow-hidden", "overscroll-none")

        // On element unmount
        return () => {
            document.body.classList.remove("overflow-hidden", "overscroll-none")
        }
    })
}