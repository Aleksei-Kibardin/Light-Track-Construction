import type { TrackMount, Finish } from "../types/configurator"

export const TRACK_PHOTOS: Record<TrackMount, Record<Finish, string>> = {
  surface: {
    black: "/src/assets/photos/surface-black.png",
    white: "/src/assets/photos/surface-white.png",
  },
  recessed: {
    black: "/src/assets/photos/recessed-black.jpg",
    white: "/src/assets/photos/recessed-white.jpg",
  },
}

export const DEFAULT_MOUNT: TrackMount = "surface"
export const DEFAULT_FINISH: Finish = "black"

export function getTrackPhoto(
  mount: TrackMount | undefined,
  color: Finish | undefined,
): string {
  const safeMount = mount && TRACK_PHOTOS[mount] ? mount : DEFAULT_MOUNT
  const byMount = TRACK_PHOTOS[safeMount]
  const safeColor = color && byMount[color] ? color : DEFAULT_FINISH
  return byMount[safeColor]
}