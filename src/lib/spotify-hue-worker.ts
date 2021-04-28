import createSpotifyHueSync, { SpotifyHueSyncArgs } from './spotify-hue'
import { workerData, parentPort } from 'worker_threads'
import assertFader from './functions/assert-fader'

const start = async () => {
  const spotifyHueSync = await createSpotifyHueSync(
    ...(workerData as SpotifyHueSyncArgs)
  )

  parentPort.on('close', async () => {
    await spotifyHueSync.stop()
    process.exit(0)
  })

  parentPort.on('message', (data) => {
    if (data.latency) {
      spotifyHueSync.changeLatency(data.latency)
    }

    if (data.fader) {
      try {
        assertFader(data.fader)
      } catch {
        throw new Error('Invalid fader input')
      }
      spotifyHueSync.changeSegmentFader(data.fader)
    }
  })

  try {
    await spotifyHueSync.start()
    parentPort.postMessage('started')
  } catch (e) {
    process.exit(1)
  }
}

start()
