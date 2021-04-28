const faders = {
  default: (x: number) => 1 - x,
  linearSoft: (x: number) => (x > 0.5 ? x : 1 - x),
  cubicSoft: (x: number) =>
    Math.max(Math.min(1, 0.5 - (1.4141 * x - 0.707) ** 2), 0),
  cubicAlwaysOn: (x: number) => Math.max(Math.min(0.5 - (x - 0.5), 1), 0),
  defaultSofter: (x: number) => Math.max(Math.min(1 - x ** 2, 1), 0),
  defaultSoftest: (x: number) => Math.max(Math.min(0.5 - (0.5 * x) ** 2, 1), 0),
  cubicAlwaysOnSofter: (x: number) =>
    Math.max(Math.min(0.5 - (0.5 * x - 0.25), 1), 0),
}

export default faders
