import { Model } from 'survey-core'
import { ICustomizableSurveyModel, SurveyModelCustomizer } from './interfaces'
import { DisplayPreviewMode } from './services/custom/OnPreviewMode'
import { theme } from './themes/_theme'

export class CustomizableSurveyModel extends Model implements ICustomizableSurveyModel {
  toPreview(display: DisplayPreviewMode, data: any): CustomizableSurveyModel {
    const displayMode = display.renderPreview(this.jsonObj, data)
    const displayTheme = Object.keys(display.themeVariables).length === 0 ? theme : display.themeVariables

    displayMode.applyTheme(displayTheme)

    return displayMode
  }

  customize(customizer: SurveyModelCustomizer): this
  customize(customizer: SurveyModelCustomizer[]): this
  public customize(customizer: SurveyModelCustomizer | SurveyModelCustomizer[]): this {
    if (customizer instanceof Array) {
      for (const c of customizer) {
        c(this)
      }
    } else {
      customizer(this)
    }
    return this
  }
}
