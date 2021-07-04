import { FONT_FAMILY_INPUT } from 'javascript/components/tabbed-config-form'
import { ApiStyleType } from 'javascript/utils/theme/types/ApiStylesType'

const availableFonts = (FONT_FAMILY_INPUT.options || []).map(
  option => option.value,
)

let fontLink
let loadedFonts = ''

const loadFonts = (themeStyles: ApiStyleType, loadAllFonts: boolean = false) => {
  const stylesString = JSON.stringify(themeStyles)
  let encodedFontNames: string[]
  if (!loadAllFonts) {
    const fontsInTheme = new Set<string>()
    availableFonts.forEach(fontName => {
      if (stylesString.includes(fontName)) {
        fontsInTheme.add(fontName)
      }
    })
    encodedFontNames = Array.from(fontsInTheme).map(encodeFontNames)
  } else {
    encodedFontNames = availableFonts.map(encodeFontNames)
  }

  const fontsToLoad = encodedFontNames.join('|')

  if (fontsToLoad !== loadedFonts) {
    loadedFonts = fontsToLoad
    if (fontLink) {
      document.head.removeChild(fontLink)
    }
    fontLink = document.createElement('link')
    fontLink.setAttribute('rel', 'stylesheet')
    fontLink.setAttribute('type', 'text/css')
    fontLink.setAttribute(
      'href',
      `https://fonts.googleapis.com/css?family=${fontsToLoad}&display=swap`,
    )
    document.head.appendChild(fontLink)
  }
}

const encodeFontNames = fontName => fontName.split(' ').join('+')

export default loadFonts
