export type TrackType = 'line' | 'l' | 'u' | 'p'
export type Finish = 'black' | 'white' | 'graphite'
export type FixtureType = "spot" | "wide"

export const FIXTURE_TYPES: Record<
  FixtureType,
  { label: string; short: string }
> = {
  spot: { label: "INFINITY LOCUS", short: "Spot 07" },
  wide: { label: "INFINITY OREO", short: "Wide 12" },
}

export const MAX_FIXTURES = 8

export type ConfiguratorState = {
  trackType: TrackType
  length: number
  color: Finish
  fixtures: FixtureType[]
  fractions: number[]
  temperature: number
  rotation: number
}


export const finishes: Record<
  Finish,
  { label: string; swatch: string; metalness: number; roughness: number }
> = {
  black: {
    label: 'Black',
    swatch: '#25282a',
    metalness: 0.72,
    roughness: 0.3,
  },
  white: {
    label: 'White',
    swatch: '#e6e6df',
    metalness: 0.25,
    roughness: 0.36,
  },
  graphite: {
    label: 'Graphite',
    swatch: '#646966',
    metalness: 0.8,
    roughness: 0.28,
  },
}
