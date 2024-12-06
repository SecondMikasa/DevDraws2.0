import { Camera } from "@/types/canvas"

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const COLORS = [
  "#DC2626",
  '#D97706',
  '#059669',
  '#7C3AED',
  '#DB2777',
  '#FF2C55',
  '#3B429F',
  '#e5f77d',
  '#5386E4'
]

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function connectionIdToColor(connectionId: number): string {
  return COLORS[connectionId % COLORS.length]
}

export function pointerEventToCanvasPoint(
  e: React.PointerEvent,
  camera: Camera
) {
  // FIXME: Not sure if return will have paranthesis or not
  return ({
    x: Math.round(e.clientX) - camera.x,
    y: Math.round(e.clientY) - camera.y
  })
}
