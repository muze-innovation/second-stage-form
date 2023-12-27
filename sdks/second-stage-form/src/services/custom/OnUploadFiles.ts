import type { Model, UploadFilesEvent } from 'survey-core'
import { ICustomOnUploadFiles, SurveyModelCustomizer, SurveyFileUploadValidatorScheme } from '../../interfaces'

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

    const HTML_CONTENT = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
      <div id="preview-modal" class="modal">
        <span class="close close-button">&times;</span>
        <img class="modal-content" id="image-modal">
      </div>
    
      <script>
        // Get the <span> element that closes the modal
        var closedButton = document.getElementsByClassName("close-button")[0]
    
        // When the user clicks on <span> (x), close the modal
        closedButton.onclick = function() {
          modal.style.display = "none"
        }
      </script>
    
      <style>
        .modal {
          display: none; 
          position: fixed; 
          z-index: 2; 
          padding-top: 100px; 
          padding-bottom: 100px;
          left: 0;
          top: 0;
          width: 100%; 
          height: 100%;
          overflow: auto; 
          background-color: rgb(0,0,0); 
          background-color: rgba(0,0,0,0.7);
        }
    
        .modal-content {
          margin: auto;
          display: block;
          width: 80%;
          max-width: ${customProperties.modalMaxWidth || 700}px;
        }
    
        .close {
          position: absolute;
          top: 15px;
          right: 35px;
          color: #f1f1f1;
          font-size: 25px;
          font-weight: bold;
          transition: 0.3s;
        }
    
        .close:hover,
        .close:focus {
          color: #bbb;
          text-decoration: none;
          cursor: pointer;
        }
    
        @media only screen and (max-width: 700px){
          .modal-content {
            width: 100%;
          }
        }
      </style>
    
    </body>
    </html>    
    `

    let modal = document.body.querySelector('.modal') as HTMLElement
    if (!modal) {
      const resp = await fetch('preview-modal.html')
      const html = await resp.text()
      document.body.insertAdjacentHTML('beforeend', HTML_CONTENT)
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
