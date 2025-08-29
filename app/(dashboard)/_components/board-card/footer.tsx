import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
    title: string;
    authorLabel: string;
    createAtLabel: string;
    onClick: () => void;
    disabled: boolean;
    isFavourite: boolean;
}

export const Footer = ({
    title,
    authorLabel,
    createAtLabel,
    onClick,
    disabled,
    isFavourite
}: FooterProps) => {

    const handleClick = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
    };
    
    return (
        <div
            className="relative bg-white p-3 sm:p-3"
        >
            <p
                className="text-sm sm:text-[13px] truncate max-w-[calc(100%-32px)] sm:max-w-[calc(100%-20px)] font-medium"
            >
                {title}
            </p>
            <p
                className="opacity-0 group-hover:opacity-100 sm:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity text-xs sm:text-[11px] text-muted-foreground truncate mt-1"
            >
                {authorLabel}, {createAtLabel}
            </p>
            <button
                disabled={disabled}
                onClick={handleClick}
                className={cn(
                    "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition absolute top-3 right-3 text-muted-foreground hover:text-blue-600 touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center sm:block",
                    disabled && "cursor-not-allowed opacity-75"
                )}
            >
                <Star
                    className={cn(
                        "h-5 w-5 sm:h-4 sm:w-4",
                        isFavourite && "fill-blue-600 text-blue-600"
                    )}
                />
            </button>
        </div>
    )
}