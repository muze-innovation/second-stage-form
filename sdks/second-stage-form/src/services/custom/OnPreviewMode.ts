import type { IQuestionPlainData } from 'survey-core/typings/question'
import type { TextMarkdownEvent } from 'survey-core'

import { Model, settings } from 'survey-core'
import { CustomizableSurveyModel } from '../../SuperSurveyModel'

const iconCheck = require('../../public/icons/icon-check-green.svg')

// TODO: add more other case
export abstract class DisplayPreview extends CustomizableSurveyModel {
  protected customizeImages(name: this): string {
    // TODO: implement that can customize icon on prefix text preview
    return ''
  }

  protected customizeCheckboxRender(data: IQuestionPlainData): string {
    // TODO: implement that can customize icon on prefix text preview
    return `
      <div>
        <img src="${iconCheck}" />
        <p> ${data.title} </p>
      </div>
    `
  }

  protected senderManager(type: string, data: IQuestionPlainData, options: TextMarkdownEvent): void {
    switch (type) {
      // FIXME: change case to checkbox
      case 'dropdown':
        options.html = this.customizeCheckboxRender(data)
        break
      // TODO: add more other case
      default:
        options.html = options.text
        break
    }
  }
  public renderPreview(surveyJson: any, data: any): CustomizableSurveyModel {
    const cloned = new Model(JSON.parse(JSON.stringify(surveyJson)))

    const converted = JSON.parse(JSON.stringify(surveyJson).replace(/checkbox|radiogroup|dropdown/gm, 'text'))
    const csm = new CustomizableSurveyModel(converted)
    csm.mergeData(data)
    cloned.mergeData(data)

    const p = cloned.getPlainData()

    csm.onTextMarkdown.add((_, options) => {
      const found = p.find((o) => o.name === options.element.name)
      if (!found) {
        // skip if not found elemant in schema
        return
      }
      // detech type of question
      const type = cloned.getQuestionByName(options.element.name).getType()
      this.senderManager(type, found, options)
    })

    csm.mode = 'display'
    settings.readOnlyTextRenderMode = 'div'
    return csm
  }
}

export class DisplayPreviewMode extends DisplayPreview {
  public static make() {
    return new DisplayPreviewMode()
  }
}
