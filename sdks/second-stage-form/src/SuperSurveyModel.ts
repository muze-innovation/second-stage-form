import { Model } from 'survey-core'
import { ICustomizableSurveyModel, SurveyModelCustomizer } from './interfaces'

export class CustomizableSurveyModel extends Model implements ICustomizableSurveyModel {
  displayPreview(data: any): Model {
    // TODO: add class for cutom preview data here
    // use uper.getPlainData()
    // can get data to convert to input
    // call merge data to pre fill data to input
    return new Model()
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
