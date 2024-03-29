import type { IQuestionPlainData } from 'survey-core/typings/question'
import type { AfterRenderQuestionEvent, TextMarkdownEvent, UploadFilesEvent } from 'survey-core'
import type { SurveyFileUploadValidatorScheme, SurveyModelCustomizer } from '../../interfaces'

import { Model, settings } from 'survey-core'
import { getPreviewModalHTML } from './ComponentUtils'

// TODO: add more other case

export abstract class DisplayPreview {
  private addedFilePreviewOnClick(option: AfterRenderQuestionEvent) {
    const { jsonObj } = option.question as any
    const customProperties = jsonObj.custom as SurveyFileUploadValidatorScheme

    const html = getPreviewModalHTML(customProperties)

    let modal = document.body.querySelector('.modal') as HTMLElement
    if (!modal) {
      // const html = await resp.text()
      document.body.insertAdjacentHTML('beforeend', html)
      modal = document.body.querySelector('.modal') as HTMLElement
    }

    const preview = document.querySelectorAll('.sd-file__image-wrapper > img') as NodeListOf<HTMLElement>
    const imageModal = document.getElementById('image-modal') as HTMLImageElement
    const closedButtons = document.querySelectorAll('.close-button') as NodeListOf<HTMLElement>

    preview.forEach((p) => {
      if (modal && imageModal) {
        p.onclick = function () {
          modal.style.display = 'block'
          imageModal.src = (this as HTMLImageElement).src
        }
      }
    })

    closedButtons.forEach((button) => {
      if (modal) {
        button.onclick = function () {
          modal.style.display = 'none'
        }
      }
    })
  }

  protected customizeImages(name: this): string {
    // TODO: implement that can customize icon on prefix text preview
    return ''
  }

  protected customizeCheckboxRender(data: IQuestionPlainData): string {
    // TODO: add class for caller customize
    return `
    <div style="padding-bottom: 4px"> ${data.title} </div>
    <div class="sd-text__content sd-question__content" style="display: flex; flex-direction: column; justify-items: center; gap: 0.5rem;">
      ${
        data.value && data.value.length > 0
          ? data.value
              .map((item: string | number) => {
                return ` 
              <div style="display: flex; align-items: center; gap: 0.5rem;">
              <svg width="16" height="16"><use href="#icon-v2check"></use></svg>
              <div> ${item} </div>
              </div>`
              })
              .join(' ')
          : `<svg width="16" height="16"><use href="#icon-v2check"></use></svg>
            <div> ${data.displayValue} </div>`
      }
    </div>`
  }

  protected customizeRadioGroupRender(data: IQuestionPlainData): string {
    return `
      <div> ${data.title} </div>
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

      model.onAfterRenderQuestion.add(async (_, o) => {
        this.addedFilePreviewOnClick(o)
      })

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
