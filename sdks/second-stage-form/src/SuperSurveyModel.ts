import { Model, settings } from 'survey-core'
import { ICustomizableSurveyModel, SurveyModelCustomizer } from './interfaces'
// const iconCheck = require('./public/icons/icon-check-green.svg')

export class CustomizableSurveyModel extends Model implements ICustomizableSurveyModel {
  toPreview(data: any): Model {
    // TODO: add class for cutom preview data here
    // use this.jsonObj
    // can get data to convert to input
    const converted = JSON.parse(JSON.stringify(this.jsonObj).replace(/dropdown/gm, 'text'))
    const m = new CustomizableSurveyModel(converted)
    m.mode = 'display'
    settings.readOnlyTextRenderMode = 'div'
    // m.onTextMarkdown.add(function (_, options) {
    //   // Convert Markdown to HTML
    //   console.log('options ======> ', options.text)
    //   console.log('iconcheck ======= ', iconCheck)

    //   // options.html = str;
    //   // options.html = `<img src="${iconCheck}" />`
    // })
    return m
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
