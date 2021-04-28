import { bridge as pheaBridge } from 'phea'
import { performance } from 'perf_hooks'
import { HueBridge } from 'phea/build/hue-bridge'
import faders from '../constants/faders'
import calculatePitches from '../lib/functions/calculate-pitches'
import fetchSpotifyAccessToken from '../lib/spotify-fetchers/fetch-spotify-access-token'
import fetchSpotifyPlaybackState from '../lib/spotify-fetchers/fetch-spotify-playback-state'
import fetchSpotifyTrackSegments from '../lib/spotify-fetchers/fetch-spotify-track-segments'
import SpotifyCredentials from '../types/spotify-credentials'
import SpotifyTrackSegment from '../types/spotify-track-segment'
import fetchColorPaletteFromRemoteImage from '../lib/functions/fetch-color-palette-from-remote-image'

export type SpotifyHueSyncArgs = [
  groupName: string,
  hueCredentials: {
    address: string
    username: string
    psk: string
  },
  spotifyCredentials: SpotifyCredentials,
  syncOptions?: {
    latency?: number
    segmentFader?: keyof typeof faders
    spotifyPollingInterval?: number
  }
]

type CreateSpotifyHueSync = (
  ...args: SpotifyHueSyncArgs
) => Promise<{
  stop: () => Promise<void>
  start: () => Promise<void>
  changeLatency: (newLatency: number) => void
  isRunning: () => boolean
  changeSegmentFader: (newSegmentFader: keyof typeof faders) => void
}>

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const startBridge = (bridge: HueBridge, id: string, timeout = 5000) =>
  new Promise<void>(async (resolve, reject) => {
    const errorHandler = (e) => {
      if (e?.message !== 'Error: The DTLS handshake timed out') {
        return
      }

      reject('Failed to start: DTLS handshake timed out')
    }
    process.on('uncaughtException', errorHandler)

    await bridge.start(id)
    await wait(timeout)

    process.removeListener('uncaughtException', errorHandler)

    resolve()
  })

const createSpotifyHueSync: CreateSpotifyHueSync = async (
  groupName,
  hueCredentials,
  spotifyCredentials,
  { spotifyPollingInterval = 2000, latency = 0, segmentFader = 'default' } = {}
) => {
  let running = false
  // @ts-ignore
  const bridge = await pheaBridge({ ...hueCredentials })

  const groups = await bridge.getGroup(0)

  const [id] =
    Object.entries(groups).find(
      // @ts-ignore
      ([, { name }]) => name === groupName
    ) || []

  if (!id) {
    throw new Error('Group not found')
  }

  let coverPalette = [[255, 255, 255]]

  let spotifyAccessToken = await fetchSpotifyAccessToken(spotifyCredentials)
  setInterval(async () => {
    spotifyAccessToken = await fetchSpotifyAccessToken(spotifyCredentials)
  }, 1000 * 60 * 30)

  let [spotifyPlaybackState, fetchLatency] = await fetchSpotifyPlaybackState(
    spotifyAccessToken
  )
  setInterval(async () => {
    ;[spotifyPlaybackState, fetchLatency] = await fetchSpotifyPlaybackState(
      spotifyAccessToken
    )

    const albumCoverUrl = spotifyPlaybackState?.albumCover
    if (!albumCoverUrl) {
      coverPalette = [[255, 255, 255]]
      return
    }
    coverPalette = await fetchColorPaletteFromRemoteImage(albumCoverUrl)
  }, spotifyPollingInterval - 100)

  let segments = [] as SpotifyTrackSegment[]
  setInterval(async () => {
    if (!running) {
      segments = [] as SpotifyTrackSegment[]
      return
    }
    segments = spotifyPlaybackState?.isPlaying
      ? await fetchSpotifyTrackSegments(
          spotifyAccessToken,
          spotifyPlaybackState.trackId
        )
      : ([] as SpotifyTrackSegment[])
  }, spotifyPollingInterval + 100)

  const start = async () => {
    if (running) throw new Error('Already running')
    await startBridge(bridge, id)
    running = true
    loop()
  }

  const stop = async () => {
    if (!running) throw new Error('Not running')
    await wait(100)
    await bridge.transition([0], [255, 255, 255], 0)
    await wait(100)
    await bridge.stop()
    running = false
  }

  const changeLatency = (newLatency: number) => {
    latency = newLatency
  }

  const { lights } = await bridge.getGroup(id)

  let acknowledgedProgressOverwrite: number = 0

  const loop = (
    progress: number = spotifyPlaybackState?.progress || 0,
    timestamp: number = performance.now()
  ) => {
    if (!running) return

    const progressOverwrite = spotifyPlaybackState?.progress || 0
    let actualProgress = progress
    if (
      acknowledgedProgressOverwrite !== progressOverwrite ||
      !spotifyPlaybackState?.isPlaying
    ) {
      actualProgress = progressOverwrite
      acknowledgedProgressOverwrite = progressOverwrite
    }

    const currentTimestamp = performance.now()
    const timeDifference = currentTimestamp - timestamp

    const pitches = calculatePitches(
      actualProgress + latency,
      segments,
      faders[segmentFader]
    )

    for (const i of Object.keys(lights)) {
      if (bridge.pheaEngine.running)
        bridge.transition(
          [i],
          (coverPalette[i] || coverPalette[0]).map((val) =>
            Math.floor(val * pitches[i])
          )
        )
    }

    setTimeout(
      () =>
        loop(
          segments.length ? actualProgress + timeDifference : 0,
          currentTimestamp
        ),
      25
    )
  }

  const changeSegmentFader = (newSegmentFader: keyof typeof faders) => {
    segmentFader = newSegmentFader
  }

  const isRunning = () => running

  return {
    stop,
    start,
    changeLatency,
    isRunning,
    changeSegmentFader,
  }
}

export default createSpotifyHueSync
