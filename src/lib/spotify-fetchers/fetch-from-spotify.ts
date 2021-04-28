import fetch from 'node-fetch'

const fetchFromSpotify = (accessToken, endpoint) =>
  fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => {
    if (res.status === 204) {
      return null
    }
    return res.json()
  })

export default fetchFromSpotify
