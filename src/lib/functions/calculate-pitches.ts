import faders from '../../constants/faders'
import SpotifyTrackSegment from '../../types/spotify-track-segment'

const calculatePitches = (
  progress: number,
  segments: SpotifyTrackSegment[],
  fader: typeof faders[keyof typeof faders]
) => {
  const currentSegment = segments.find(({ start, duration }) => {
    const min = start * 1000
    const max = start * 1000 + duration * 1000

    return progress >= min && progress < max
  })

  if (!currentSegment) return Array(12).fill(0)

  const { start, duration, pitches } = currentSegment

  const segmentProgress = (progress - start * 1000) / (duration * 1000)

  const segmentFadedProgress = fader(segmentProgress)

  return pitches.map((pitch) => pitch * segmentFadedProgress)
}

export default calculatePitches
