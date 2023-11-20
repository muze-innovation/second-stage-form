import { ISuperSurveyModel, ICustomSurveyModel, CustomOnChoicesLazyLoad } from './contect'
import { Model } from 'survey-core'

class CustomSurveyModel implements ICustomSurveyModel {
  constructor(private model: Model) {}

  public get onChoicesLazyLoad() {
    return new CustomOnChoicesLazyLoad(this.model.onChoicesLazyLoad)
  }
}

export class SupuerSurveyModel extends Model implements ISuperSurveyModel {
  constructor(j?: any, c?: any) {
    super(j, c)
  }
  public get custom(): ICustomSurveyModel {
    return new CustomSurveyModel(this)
  }
}
