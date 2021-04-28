import faders from '../../constants/faders'

const assertFader: (str: any) => asserts str is keyof typeof faders = (str) => {
  if (typeof str === 'string')
    throw new TypeError('Expected input to be a string')
  if (!Object.keys(faders).includes(str))
    throw new TypeError(`'${str}' is not keyof typeof faders`)
}

export default assertFader
