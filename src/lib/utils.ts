import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Navigate back if possible; otherwise go home
export function goBackOrHome() {
  try {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  } catch {
    window.location.href = '/';
  }
}
