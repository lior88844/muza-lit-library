import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "react-toastify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function addToLibrary(mediaType: string = "Album") {
  toast(`${mediaType} added successfully to your library`, {
    position: "bottom-center",
    hideProgressBar: true,
  });
}
