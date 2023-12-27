import { surveyCssClasses } from './config'
import { ISuperTheme } from './interfaces'

export const theme: ISuperTheme = {
  cssVariables: {
    ...surveyCssClasses,
  },
  colorPalette: 'light',
  isPanelless: true,
}
