import type { IQuestionPlainData } from 'survey-core/typings/question'
import type { TextMarkdownEvent } from 'survey-core'
import type { SurveyModelCustomizer } from '../../interfaces'

import { Model, settings } from 'survey-core'

// TODO: add more other case

export abstract class DisplayPreview {
  protected customizeImages(name: this): string {
    // TODO: implement that can customize icon on prefix text preview
    return ''
  }

  protected customizeCheckboxRender(data: IQuestionPlainData): string {
    return `
    <div class="sd-text__content sd-question__content" style="display: flex; justify-items: center; align-items: center; gap: 0.5rem;">
      <svg width="16" height="16"><use href="#icon-v2check"></use></svg>
      <div> ${data.displayValue} </div>
    </div>`
  }

  protected customizeRadioGroupRender(data: IQuestionPlainData): string {
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

  // for case modify title question inject html
  protected hiddenValueByType = ['checkbox', 'radiogroup']
  // for case display mode
  protected convertToTypeText = ['checkbox', 'radiogroup', 'dropdown']

  public build(): SurveyModelCustomizer {
    return (model: Model) => {
      const cloned = new Model(JSON.parse(JSON.stringify(model.schema)))
      const regex = new RegExp(this.convertToTypeText.join('|'), 'gm')
      const converted = JSON.parse(JSON.stringify(model.schema).replace(regex, 'text'))
      this.replaceIsRequiredWithFalse(converted)

      model.setJsonObject(converted)
      cloned.mergeData(model.data)

      const p = cloned.getPlainData()
      model.onTextMarkdown.add((_, options) => {
        const found = p.find((o) => o.name === options.element.name)
        if (!found) {
          // skip if not found elemant in schema
          return
        }
        // detech type of question
        const type = cloned.getQuestionByName(options.element.name).getType()
        this.senderManager(type, found, options)
      })

      for (const pd of p) {
        const name = pd.name.toString()
        const type = cloned.getQuestionByName(name).getType()

        if (this.hiddenValueByType.includes(type)) {
          model.clearValue(name)
        }
      }

      model.mode = 'display'
      settings.readOnlyTextRenderMode = 'div'

      return model
    }
  }
}

export class DisplayPreviewMode extends DisplayPreview {
  public static make() {
    return new DisplayPreviewMode()
  }
}
