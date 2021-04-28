import startWorker, { HueSyncWorker } from './lib/spotify-hue-server'
import express = require('express')
import faders from './constants/faders'
import assertFader from './lib/functions/assert-fader'

const credentials = require('../credentials.json')

const app = express()

let activeSync: HueSyncWorker | null = null

app.get('/start', async (req, res) => {
  if (activeSync) return res.status(400).send('Already running')

  try {
    activeSync = await startWorker(
      credentials.zone,
      credentials.hue,
      credentials.spotify
    )

    activeSync.onError = () => {
      activeSync = null
    }

    res.send('OK')
  } catch (e) {
    res.status(500).send('Failed to start')
  }
})

app.get('/stop', async (req, res) => {
  if (!activeSync) return res.status(400).send('Not running')

  try {
    await activeSync.stop()

    activeSync = null

    res.send('OK')
  } catch (e) {
    res.status(500).send(e?.message)
  }
})

app.get('/running', (req, res) => {
  res.send(!!activeSync)
})

app.get('/faders', (req, res) => {
  res.send(Object.keys(faders))
})

app.get('/faders/:fader', async (req, res) => {
  if (!activeSync) return res.status(400).send('Not running')

  const { fader } = req.params

  try {
    assertFader(fader)
  } catch {
    return res.status(400).send('Invalid fader')
  }

  await activeSync.changeSegmentFader(fader)

  res.send('OK')
})

app.listen(process.env.PORT || 7070)
