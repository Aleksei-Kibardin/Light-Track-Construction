export type TrackType = "line" | "l" | "u" | "p"
export type TrackMount = "surface" | "recessed"
export type FixtureType = "spot" | "linear"
export type Finish = "black" | "white"

export const MAX_FIXTURES = 8

export const TRACK_MOUNTS: Record<
  TrackMount,
  { label: string; short: string; hint: string }
> = {
  surface: {
    label: "Накладной",
    short: "Накладной",
    hint: "Крепится на поверхность потолка",
  },
  recessed: {
    label: "Встраиваемый",
    short: "Встраиваемый",
    hint: "Утапливается в потолок заподлицо",
  },
}

export const FIXTURE_TYPES: Record<
  FixtureType,
  { label: string; short: string }
> = {
  spot: { label: "Spot 07 · 7 W", short: "Spot 07" },
  linear: { label: "Linear 60 · 15 W", short: "Linear" },
}

export const finishes: Record<
  Finish,
  {
    label: string
    swatch: string
    metalness: number
    roughness: number
  }
> = {
  black: {
    label: "Чёрный",
    swatch: "#111111",
    metalness: 0.6,
    roughness: 0.35,
  },
  white: {
    label: "Белый",
    swatch: "#f4f4f2",
    metalness: 0.2,
    roughness: 0.6,
  },
}

export type ConfiguratorState = {
  mount: TrackMount
  trackType: TrackType
  length: number
  color: Finish
  fixtures: FixtureType[]
  fractions: number[]
  temperature: number
  rotation: number
}