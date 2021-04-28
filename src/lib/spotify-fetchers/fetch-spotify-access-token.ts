import fetch from 'node-fetch'
import SpotifyCredentials from '../../types/spotify-credentials'

const fetchSpotifyAccessToken = async ({
  clientId,
  clientSecret,
  refreshToken,
}: SpotifyCredentials) => {
  const body = new URLSearchParams()
  body.append('grant_type', 'refresh_token')
  body.append('refresh_token', refreshToken)

  let { access_token: accessToken } = await fetch(
    'https://accounts.spotify.com/api/token',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString('base64')}`,
      },
      body,
    }
  ).then((res) => res.json())

  return accessToken as string
}

export default fetchSpotifyAccessToken
