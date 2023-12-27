import type { IQuestionPlainData } from 'survey-core/typings/question'
import type { TextMarkdownEvent } from 'survey-core'

import { Model, settings } from 'survey-core'
import { CustomizableSurveyModel } from '../../SuperSurveyModel'

// TODO: add more other case

export abstract class DisplayPreview extends CustomizableSurveyModel {
  protected customizeImages(name: this): string {
    // TODO: implement that can customize icon on prefix text preview
    return ''
  }

  protected customizeCheckboxRender(data: IQuestionPlainData): string {
    return new DisplayPreviewMode().renderPreviewInput(data)
  }

  protected customizeRadioGroupRender(data: IQuestionPlainData): string {
    // TODO: hide old input text component
    return `
      <div class="sd-text__content sd-question__content" style="display: flex; justify-items: center; align-items: center; gap: 0.5rem;">
        <div> ${data.displayValue} </div>
      </div>
    `
  }

  protected senderManager(type: string, data: IQuestionPlainData, options: TextMarkdownEvent): void {
    switch (type) {
      case 'checkbox':
        options.html = this.customizeCheckboxRender(data)
        break
      case 'radiogroup':
        options.html = this.customizeRadioGroupRender(data)
        break
      // TODO: add more other case
      default:
        options.html = options.text
        break
    }
  }

  // FIXME: not work in visibleIf case
  protected replaceIsRequiredWithFalse(obj: any) {
    if (obj.hasOwnProperty('isRequired')) {
      obj.isRequired = false
    }

    for (const key in obj) {
      if (obj[key] !== null && typeof obj[key] === 'object') {
        this.replaceIsRequiredWithFalse(obj[key])
      }
    }
  }

  public renderPreview(surveyJson: any, data: any): CustomizableSurveyModel {
    const cloned = new Model(JSON.parse(JSON.stringify(surveyJson)))

    const converted = JSON.parse(JSON.stringify(surveyJson).replace(/checkbox|radiogroup|dropdown/gm, 'text'))
    this.replaceIsRequiredWithFalse(converted)
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

  public renderPreviewInput(data: IQuestionPlainData): string {
    return `
    <div class="sd-text__content sd-question__content" style="display: flex; justify-items: center; align-items: center; gap: 0.5rem;">
      <svg width="16" height="16"><use href="#icon-v2check"></use></svg>
      <div> ${data.displayValue} </div>
    </div>
  `
  }
}
