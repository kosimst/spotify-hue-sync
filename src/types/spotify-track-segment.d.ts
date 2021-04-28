interface SpotifyTrackSegment {
  start: number
  duration: number
  confidence: number
  loudness_start: number
  loudness_max_time: number
  loudness_max: number
  loudness_end: number
  pitches: number[]
  timbre: number[]
}

export default SpotifyTrackSegment
