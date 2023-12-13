import type { ChoicesLazyLoadEvent, Model } from 'survey-core'

export type CallbackFuction = (
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

export interface ICustomOnChoicesLazyLoad {
  build(): Promise<void>

  add(indentity: '*', func: CallbackFuction): this
  add(indentity: { name: string }, func: CallbackFuction): this
  add(indentity: { type: string }, func: CallbackFuction): this
  add(indentity: { name: string; type: string }, func: CallbackFuction): this
}

export interface ICustomOnUploadFiles {
  build(): Promise<void>
  add(path: '*', func: (files: File) => Promise<string>, onValidate?: ((files: File[]) => Promise<string>)[]): this
  add(
    { name }: { name: string },
    func: (files: File) => Promise<string>,
    onValidate?: ((files: File[]) => Promise<string>)[],
  ): this
}

// add more custom event
export interface ICustomSurveyModel {
  /**
   * modify onChoicesLazyLoad
   * can enable / disable cache results
   * can by pass callback to call api
   * can debounce response from api
   * */
  onChoicesLazyLoad: ICustomOnChoicesLazyLoad
  /**
   * modify onUploadFiles
   * can validate memtype of uploaded files per question
   * can set max size of uploaded files per question
   * can keep throw error
   */
  onUploadFiles: ICustomOnUploadFiles
}

export interface ISuperSurveyModel extends Model {
  // call custom for use custom build in function
  custom: ICustomSurveyModel
}
