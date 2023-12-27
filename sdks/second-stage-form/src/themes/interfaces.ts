// TODO: add more other class

import { ITheme } from "survey-core"

export interface ISuperTheme extends ITheme {
  cssVariables: CSSVariable
  
}

export type CSSVariable = {
  '--sjs-primary-backcolor': string
  '--sjs-primary-backcolor-dark': string
  '--sjs-primary-forecolor': string
  '--sjs-special-red': string
  '--font-family': string
  '--sd-base-vertical-padding': string
  '--sjs-font-questiontitle-color': string
  '--sjs-font-questiontitle-weight': string
  '--sjs-font-questiontitle-size': string
  '--sjs-shadow-inner': string
  '--sd-base-padding': string
}
