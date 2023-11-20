import { ChoicesLazyLoadEvent, EventBase, Model, SurveyModel } from 'survey-core'

export class CustomOnChoicesLazyLoad {
  // add event to subscribe to callback function
  constructor(private _event: EventBase<SurveyModel, ChoicesLazyLoadEvent>) {
    //
  }
  private cacheResults: Record<string, any | any[]> = {}
  private enabledCache: boolean = true

  private debounceInstance = (v: any) => v

  // enable / disable cache results
  public setDisabledCache(flag: boolean): this {
    this.enabledCache = !flag
    return this
  }
  // milliseconds
  public setDebounceWaitingTime(time: number): this {
    return this
  }

  public async add(
    func: (
      sender: Model,
      options: ChoicesLazyLoadEvent,
    ) => Promise<{
      data: Array<
        | {
            value: any
            text?: String
            imageLink?: string
            customProperty?: any
          }
        | string
      >
      totalCount: number
    }>,
  ): Promise<void> {
    this._event.add((s, o) => {
      const hashId = `${o.question.getType()}-${o.question.name}-${o.filter}-${o.take}-${o.skip}`

      if (this.enabledCache && this.cacheResults[hashId]) {
        const cData = this.cacheResults[hashId]
        o.setItems(cData.data, cData.totalCount)
        return
      }
      func(s, o).then(({ data, totalCount }) => {
        o.setItems(data, totalCount)
        if (this.enabledCache) {
          this.cacheResults[hashId] = { data, totalCount }
        }
      })
    })
  }
}

export interface ICustomSurveyModel {
  // add more custom event
  /**
   * modify onChoicesLazyLoad
   * can enable / disable cache results
   * can by pass callback to call api
   * can debounce response from api
   * */
  onChoicesLazyLoad: CustomOnChoicesLazyLoad
}

export interface ISuperSurveyModel extends Model {
  // call custom for use custom build in function
  custom: ICustomSurveyModel
}
