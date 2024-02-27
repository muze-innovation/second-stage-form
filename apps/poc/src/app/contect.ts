import { ChoicesLazyLoadEvent, EventBase, Model, QuestionFileModel, SurveyModel, UploadFilesEvent } from 'survey-core'

type CallbackFuction = (
  sender: Model,
  options: ChoicesLazyLoadEvent,
) => Promise<{
  data: Array<
    | {
        value: any
        text: string
      }
    | string
  >
  totalCount: number
}>
export class CustomOnChoicesLazyLoad {
  /**
   add indentity 
    type, name
    support all type
   **/
  // add event to subscribe to callback function

  constructor(private _event: EventBase<SurveyModel, ChoicesLazyLoadEvent>) {
    //
  }
  private cacheResults: Record<string, CallbackFuction> = {}
  add(indentity: '*', func: CallbackFuction): this
  add(indentity: { name: string }, func: CallbackFuction): this
  add(indentity: { type: string }, func: CallbackFuction): this
  add(indentity: { name: string; type: string }, func: CallbackFuction): this
  public add(indentity: { type?: string; name?: string } | '*', func: CallbackFuction) {
    let key = ''
    if (indentity === '*') {
      key = '*/*'
    } else if (indentity.name && !indentity.type) {
      key = `${indentity.name}/*`
    } else if (!indentity.name && indentity.type) {
      key = `*/${indentity.type}`
    } else {
      key = `${indentity.name}/${indentity.type}`
    }
    this.cacheResults[key] = func
    return this
    //
  }

  async build(): Promise<void> {
    this._event.add(async (s, o) => {
      const func =
        this.cacheResults['*/*'] ||
        this.cacheResults[`*/${o.question.getType()}`] ||
        this.cacheResults[`${o.question.name}/*`] ||
        this.cacheResults[`${o.question.name}/${o.question.getType()}`]

      if (!func) {
        o.setItems([], 0)
      } else {
        const { data, totalCount } = await func(s, o)
        o.setItems(data, totalCount)
      }
    })
  }
}

export class CustomOnUploadFiles {
  constructor(private _uploadFiles: EventBase<SurveyModel, UploadFilesEvent>) {
    //
  }
  private cacheFunctions: Record<string, (files: File) => Promise<string>> = {}
  private cacheCustomValidates: Record<string, (files: File) => Promise<void>> = {}

  private validate(option: UploadFilesEvent) {
    const { jsonObj } = option.question as any

    // validate max size

    if (jsonObj.maxFiles < option.files.length) {
      // create new error class
      throw new Error('is over max file size')
    }

    for (const file of option.files) {
      if (jsonObj.maxSize < file.size) {
        throw new Error('')
      }
    }
  }

  public addCustomValidate(path: '*' | { name: string }, onValidate: (file: File) => Promise<void>) {
    const key = typeof path === 'string' ? path : path.name
    this.cacheCustomValidates[key] = onValidate
    //
    return this
  }

  public add(
    path: '*' | { name: string },
    func: (files: File) => Promise<string>,
    validates: (() => string)[] = [],
  ): this {
    const key = typeof path === 'string' ? path : path.name
    this.cacheFunctions[key] = func
    return this
  }
  // add validate max file size

  public build(): void {
    this._uploadFiles.add(async (s, o) => {
      const func = this.cacheFunctions['*'] || this.cacheFunctions[o.question.name]

      if (func) {
        try {
          this.validate(o)

          const resp = await Promise.all(o.files.map(func))

          o.callback(
            'success',
            resp.map((r, i) => ({
              file: o.files[i],
              name: o.files[i].name,
              content: r,
            })),
          )
        } catch (error) {
          console.log('error ==>', error)
          o.callback('error', error?.message)
          //
        }
      }
    })
  }
}

// add more custom event
export interface ICustomSurveyModel {
  /**
   * modify onChoicesLazyLoad
   * can enable / disable cache results
   * can by pass callback to call api
   * can debounce response from api
   * */
  onChoicesLazyLoad: CustomOnChoicesLazyLoad
  /**
   * modify onUploadFiles
   * can validate memtype of uploaded files per question
   * can set max size of uploaded files per question
   * can keep throw error
   */
  onUploadFiles: CustomOnUploadFiles
}

export interface ISuperSurveyModel extends Model {
  // call custom for use custom build in function
  custom: ICustomSurveyModel
}
