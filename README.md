# spotify-hue-sync

Sync your Hue Lights with your Spotify playback.

## What is it?

This project controls your Hue lights based on the Spotify Audio Analysis of your current playback in realtime. Each light represents a pitch. The colors are extracted from the album cover of your playback. Playback is rendered at roughly 30fps with 0ms latency. If you experience any latency, you can configure this project accordingly.

## How-to

For the best experience, at least 8 bulbs are recommended, as there are 12 pitches. With fewer lamps, not every pitch is synced and it can therefore look out of sync.

This project uses the Entertainment API of your Hue Bridge. Therefore, you need to set up an entertainment area via the Hue App.

To get started you need to provide your credentials for both your Spotify Account as well as your Hue Bridge. Put them in a file called credentials.json at the project's root. The file should be structured like this:

```
{
  "zone": "<the name of your entertainment area",
  "hue": {
    "address": "<IP adress of your bridge",
    "username": "<Hue Bridge Credentials>",
    "psk": "<Hue Bridge Credentials>"
  },
  "spotify": {
    "clientId": "<Spotify Credentials>",
    "clientSecret": "<Spotify Credentials>",
    "refreshToken": "<Spotify Credentials>"
  }
}
```

Please refer to the documentation of the node-phea package on how to get your bridge credentials.

## Usage

Just run `npm start` (after you installed all dependencies via `npm i`) and your server is ready. Go to `localhost:7070/start` to start syncing and `localhost:7070/stop` to stop it.
