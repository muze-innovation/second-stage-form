import { Model, QuestionCheckboxModel, QuestionDropdownModel, QuestionRadiogroupModel, settings } from 'survey-core'
import { IDisplayPreviewMode } from 'src/interfaces'
import { CustomizableSurveyModel } from 'src/SuperSurveyModel'
const iconCheck = require('../../public/icons/icon-check-green.svg')

export class DisplayPreviewMode extends Model implements IDisplayPreviewMode {
  public customizeImages(name: this): this {
    // TODO: implement that can customize icon on prefix text preview
    return this
  }

  public static customizeInput(surveyJson: any): CustomizableSurveyModel {
    const converted = JSON.parse(JSON.stringify(surveyJson).replace(/checkbox|radiogroup|dropdown/gm, 'text'))
    const csm = new CustomizableSurveyModel(surveyJson)

    csm.onTextMarkdown.add(function (_, options) {
      // Convert Markdown to HTML
      // TODO: check QuestionDropdownModel type
      // TODO: check CheckboxModel type or CheckboxBase
      // TODO: add default check icon for preview radiogroup
      console.log('sender ------> ', _, 'options ------> ', options)
      const s = _.getAllQuestions().filter(
        (q) =>
          q instanceof QuestionDropdownModel ||
          q instanceof QuestionRadiogroupModel ||
          q instanceof QuestionCheckboxModel,
      )
      options.element.isRequired = false
      if (options.element instanceof QuestionDropdownModel) {
        options.html = `<img src="${iconCheck}" />`
      } else {
        options.html = options.text
      }
    })
    // const m = new CustomizableSurveyModel(this.jsonObj)
    // console.log('customized model ----> ', m)
    // console.log('preview model -----> ', this)
    // this.jsonObj = converted
    csm.mode = 'display'
    settings.readOnlyTextRenderMode = 'div'
    const newJson = csm.toJSON()

    // console.log('newJson -----> ', newJson)
    // const previewModel = new CustomizableSurveyModel(converted)
    return csm
  }
}
