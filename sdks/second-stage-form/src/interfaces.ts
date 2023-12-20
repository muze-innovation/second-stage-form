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

export interface SurveyFileUploadValidatorScheme {
  maxFileSize: string
}

export type SurveyModelCustomizer = (model: Model) => void

interface BaseCustomBuilder {
  build(): SurveyModelCustomizer
}
/**
 * modify onChoicesLazyLoad
 * can enable / disable cache results
 * can by pass callback to call api
 * can debounce response from api
 * */
export interface ICustomOnChoicesLazyLoadBuilder extends BaseCustomBuilder {
  add(identity: '*', func: CallbackFuction): this
  add(identity: { name: string }, func: CallbackFuction): this
  add(identity: { type: string }, func: CallbackFuction): this
  add(identity: { name: string; type: string }, func: CallbackFuction): this
}

/**
 * modify onUploadFiles
 * can validate memtype of uploaded files per question
 * can set max size of uploaded files per question
 * can keep throw error
 */
export interface ICustomOnUploadFiles extends BaseCustomBuilder {
  add(
    identity: '*',
    func: (files: File[]) => Promise<string[]>,
    onValidate?: ((files: File[]) => Promise<string>)[],
  ): this
  add(
    identity: { name: string },
    func: (files: File[]) => Promise<string[]>,
    onValidate?: ((files: File[]) => Promise<string>)[],
  ): this
}

export interface IDisplayPreviewMode {
  customizeImages: (name: this) => this
  customizeChoices: (type: 'checkbox' | 'radio' | 'dropdown', name: this) => this
}

export interface ICustomizableSurveyModel extends Model {
  customize(customizer: SurveyModelCustomizer): this
  toPreview(data: any): Model
}
