import { Model } from 'survey-core'
import { ICustomizableSurveyModel, SurveyModelCustomizer } from './interfaces'
import { DisplayPreviewMode } from './services/custom/OnPreviewMode'

export class CustomizableSurveyModel extends Model implements ICustomizableSurveyModel {
  toPreview(): Model {
    return DisplayPreviewMode.customizeInput(this.jsonObj)
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
