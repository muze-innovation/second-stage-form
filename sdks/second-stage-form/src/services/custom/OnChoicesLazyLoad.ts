import { ChoicesLazyLoadEvent, EventBase, SurveyModel } from 'survey-core'
import { CallbackFuction, ICustomOnChoicesLazyLoad } from '../../interfaces'

export class CustomOnChoicesLazyLoad implements ICustomOnChoicesLazyLoad {
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
