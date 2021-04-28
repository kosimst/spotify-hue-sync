import SpotifyTrackSegment from '../../types/spotify-track-segment'
import fetchFromSpotify from './fetch-from-spotify'

const fetchSpotifyTrackSegments = async (accessToken: string, id: string) => {
  const result = await fetchFromSpotify(accessToken, `/audio-analysis/${id}`)

  if (result) return result.segments as SpotifyTrackSegment[]
  return [] as SpotifyTrackSegment[]
}

export default fetchSpotifyTrackSegments
