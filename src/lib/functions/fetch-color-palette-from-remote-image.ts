const getImageColors = require('get-image-colors')

const minBrightness = 160

const getPercievedBrightness = ([r, g, b]: [number, number, number]) =>
  Math.ceil(0.21 * r + 0.72 * g + 0.07 * b)

const checkColor = (rgb) => {
  const percievedBrightness = getPercievedBrightness(rgb)

  if (percievedBrightness >= minBrightness) return rgb

  const currentMaxValue = Math.max(...rgb)
  const factor = Math.min(
    minBrightness / percievedBrightness,
    255 / currentMaxValue
  )

  return rgb.map((val) =>
    factor === Infinity ? minBrightness : Math.ceil(val * factor)
  )
}

const fetchColorsFromRemoteImage = async (url: string, count = 12) => {
  const imageColors = await getImageColors(url, {
    count: count + 1,
  })

  return imageColors.map((color) => color.rgb())
}

const fetchColorPaletteFromRemoteImage = async (url: string, count = 12) => {
  const imageColors = await fetchColorsFromRemoteImage(url)

  const checkedColors = imageColors.map((color) => checkColor(color))
  return checkedColors
}

export default fetchColorPaletteFromRemoteImage
