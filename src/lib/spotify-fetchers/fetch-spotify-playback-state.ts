import { performance } from 'perf_hooks'
import fetchFromSpotify from './fetch-from-spotify'

const fetchSpotifyPlaybackState = async (
  accessToken: string
): Promise<
  [
    {
      trackId: string
      progress: number
      isPlaying: boolean
      albumCover: string
    } | null,
    number
  ]
> => {
  const before = performance.now()
  let {
    item: {
      id,
      album: { images: [{ url: albumCover } = { url: '' }] = [] } = {},
    },
    progress_ms,
    is_playing,
  } = ((await fetchFromSpotify(accessToken, '/me/player')) || { item: {} }) as {
    item?: { id?: string; album: { images: [{ url: string }] } }
    progress_ms?: number
    is_playing?: boolean
  }
  const after = performance.now()

  return [
    (id as string | undefined)
      ? {
          trackId: id,
          progress: progress_ms,
          isPlaying: is_playing,
          albumCover,
        }
      : null,
    after - before,
  ]
}

export default fetchSpotifyPlaybackState
