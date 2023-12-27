import { Model } from 'survey-core'
import { ICustomizableSurveyModel, SurveyModelCustomizer } from './interfaces'
import { theme } from './themes/_theme'
import { ISuperTheme } from './themes/interfaces'

export class CustomizableSurveyModel extends Model implements ICustomizableSurveyModel {
  public static defaultTheme(): ISuperTheme {
    return theme
  }

  customize(customizer: SurveyModelCustomizer): this
  customize(customizer: SurveyModelCustomizer[]): this
  public customize(customizer: SurveyModelCustomizer | SurveyModelCustomizer[]): this {
    // add jsonObj into object
    this.schema = this.jsonObj
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
