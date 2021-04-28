import { Worker } from 'worker_threads'
import faders from '../constants/faders'
import { SpotifyHueSyncArgs } from './spotify-hue'
import { join } from 'path'

export type HueSyncWorker = {
  stop: () => Promise<number>
  changeLatency: (latency: number) => void
  changeSegmentFader: (segmentFader: keyof typeof faders) => void
  onError: (cb: () => void) => void
}

const startWorker = async (...args: SpotifyHueSyncArgs) =>
  new Promise<HueSyncWorker>((resolve, reject) => {
    const worker = new Worker(join(__dirname, 'spotify-hue-worker.js'), {
      workerData: args,
    })

    let started = false
    let errorCallback = null

    worker.on('exit', (exitCode) => {
      if (exitCode !== 0) {
        if (!started) {
          reject(new Error('Failed to start'))
          return
        }

        if (errorCallback) errorCallback()
      }
    })

    const onError = (cb: () => void) => {
      errorCallback = cb
    }

    worker.on('message', (msg) => {
      if (msg === 'started') {
        started = true
        const result = {
          stop: () => worker.terminate(),
          changeLatency: (latency: number) => worker.postMessage({ latency }),
          changeSegmentFader: (segmentFader: string) =>
            worker.postMessage({ segmentFader }),
          onError,
        }
        resolve(result)
      }
    })
  })

export default startWorker
