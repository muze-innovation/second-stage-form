import type { Model, UploadFilesEvent } from 'survey-core'
import { ICustomOnUploadFiles, SurveyModelCustomizer, SurveyFileUploadValidatorScheme } from '../../interfaces'
import { getPreviewModalHTML } from './ComponentUtils'

export class CustomOnUploadFilesBuilder implements ICustomOnUploadFiles {
  public static make(): CustomOnUploadFilesBuilder {
    return new CustomOnUploadFilesBuilder()
  }
  private cacheFunctions: Record<
    string,
    {
      callback: (files: File[]) => Promise<string[]>
      validation: ((files: File[]) => Promise<string>)[]
      onOpenPreviewModal: () => void
      onClosePreviewModal: () => void
    }
  > = {}

  private errorMessages: Record<string, string> = {}

  public setErrorMessages(messages: Record<string, string>) {
    this.errorMessages = messages
    return this
  }

  private validate(option: UploadFilesEvent) {
    const { jsonObj } = option.question as any
    const customProperties = jsonObj.custom as SurveyFileUploadValidatorScheme
    const question = option.question

    if (customProperties) {
      const questionValues = question.value || []
      // validate max size
      if (questionValues.length + option.files.length > customProperties.maxFiles) {
        // create new error class
        // throw new Error('Max number of files reached')
        // throw new Error(customProperties.maxFilesErrorText) // (0) use fron json
        throw new Error(this.errorMessages.maxFiles) // (3) set in code
      }

      const totalSize = option.files.reduce((total, cur) => (total += cur.size), 0)
      if (totalSize > customProperties.maxTotalFileSize) {
        throw new Error('Total file size exceed')
      }
    }

    for (const file of option.files) {
      if (jsonObj.maxSize < file.size) {
        throw new Error('')
      }
    }
  }

  private async addFilePreviewOnClick(sender: Model, option: UploadFilesEvent) {
    const func = this.cacheFunctions[option.question.name] || this.cacheFunctions['*']
    const { jsonObj } = option.question as any
    const customProperties = jsonObj.custom as SurveyFileUploadValidatorScheme
    if (!customProperties.enableZoomInModal) return

    const html = getPreviewModalHTML(customProperties)

    let modal = document.body.querySelector('.modal') as HTMLElement
    if (!modal) {
      const resp = await fetch('preview-modal.html')
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
          func?.onOpenPreviewModal()
        }
      }
    })

    closedButtons.forEach((button) => {
      if (modal) {
        button.onclick = function () {
          modal.style.display = 'none'
          func?.onClosePreviewModal()
        }
      }
    })
  }

  public add(
    path: '*' | { name: string },
    func: (files: File[]) => Promise<string[]>,
    onValidate: ((files: File[]) => Promise<string>)[] = [],
    onOpenModal: () => void = () => {},
    onCloseModal: () => void = () => {},
  ): this {
    const key = typeof path === 'string' ? path : path.name
    this.cacheFunctions[key] = {
      callback: func,
      validation: onValidate,
      onOpenPreviewModal: onOpenModal,
      onClosePreviewModal: onCloseModal,
    }
    return this
  }

  public addCustomError(path: string) {
    //
  }

  // add validate max file size
  build(): SurveyModelCustomizer {
    return (model: Model) => {
      model.onAfterRenderQuestion.add(async (_, options) => {
        if (options.question.name === 'disable-images') {
          options.question.readOnly = true
          const uploadAction = options.htmlElement.querySelector('.sd-file--answered .sd-file__actions-container')
          if (uploadAction) {
            // can do both
            uploadAction.classList.add('hide')
            // uploadAction.style.display = 'none'
          }
        }
      })

      model.onUploadFiles.add(async (s, o) => {
        this.addFilePreviewOnClick(s, o)

        const func = this.cacheFunctions[o.question.name] || this.cacheFunctions['*']

        if (!func) {
          throw new Error('cannot find custom function')
        }
        try {
          this.validate(o)

          for (const validate of func.validation) {
            validate(o.files)
          }

          const resp = await func.callback(o.files)

          o.callback(
            'success',
            resp.map((r, i) => {
              return {
                file: o.files[i],
                name: o.files[i].name,
                content: r,
              }
            }),
          )
        } catch (error) {
          o.callback('error', (error as any)?.message)
        }
      })
    }
  }
}
