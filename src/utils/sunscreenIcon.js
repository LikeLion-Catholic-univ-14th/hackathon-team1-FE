import sunscreenIcon01 from '../assets/sunscreen/sunscreen-icon-01.svg'
import sunscreenIcon02 from '../assets/sunscreen/sunscreen-icon-02.svg'
import sunscreenIcon03 from '../assets/sunscreen/sunscreen-icon-03.svg'
import sunscreenIcon04 from '../assets/sunscreen/sunscreen-icon-04.svg'
import sunscreenIcon05 from '../assets/sunscreen/sunscreen-icon-05.svg'
import sunscreenIcon06 from '../assets/sunscreen/sunscreen-icon-06.svg'

const sunscreenIcons = [
  sunscreenIcon01,
  sunscreenIcon02,
  sunscreenIcon03,
  sunscreenIcon04,
  sunscreenIcon05,
  sunscreenIcon06,
]

export function getSunscreenIcon(productId) {
  const numId = typeof productId === 'number' ? productId : parseInt(productId, 10)
  const index = isNaN(numId) ? 0 : Math.abs(numId) % sunscreenIcons.length
  return sunscreenIcons[index]
}

export { sunscreenIcons }
