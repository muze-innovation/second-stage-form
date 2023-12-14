import { Model } from 'survey-core'
import { CallbackFuction, ICustomOnChoicesLazyLoadBuilder, SurveyModelCustomizer } from '../../interfaces'

export class CustomOnChoiceLazyLoadBuilder implements ICustomOnChoicesLazyLoadBuilder {
  public static make(): CustomOnChoiceLazyLoadBuilder {
    return new CustomOnChoiceLazyLoadBuilder()
  }

  /**
   add indentity 
    type, name
    support all type
   **/
  // add event to subscribe to callback function
  private cacheResults: Record<string, CallbackFuction> = {}

  add(indentity: '*', func: CallbackFuction): this
  add(indentity: { name: string }, func: CallbackFuction): this
  add(indentity: { type: string }, func: CallbackFuction): this
  add(indentity: { name: string; type: string }, func: CallbackFuction): this
  public add(indentity: { type?: string; name?: string } | '*', func: CallbackFuction) {
    let key = ''
    if (indentity === '*') {
      key = '*/*'
    } else {
      key = `${indentity.name || '*'}/${indentity.type || '*'}`
    }
    this.cacheResults[key] = func
    return this
    //
  }

  build(): SurveyModelCustomizer {
    return (model: Model) => {
      model.onChoicesLazyLoad.add(async (s, o) => {
        // this should be rearranged.
        const func =
          this.cacheResults[`${o.question.name}/${o.question.getType()}`] ||
          this.cacheResults[`${o.question.name}/*`] ||
          this.cacheResults[`*/${o.question.getType()}`] ||
          this.cacheResults['*/*']

        if (!func) {
          o.setItems([], 0)
        } else {
          const { data, totalCount } = await func(s, o)
          o.setItems(data, totalCount)
        }
      })
    }
  }
}
