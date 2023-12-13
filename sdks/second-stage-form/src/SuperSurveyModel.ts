import { Model } from 'survey-core'

import { ICustomOnChoicesLazyLoad, ICustomOnUploadFiles, ICustomSurveyModel, ISuperSurveyModel } from './interfaces'
import { CustomOnChoicesLazyLoad, CustomOnUploadFiles } from './services/custom'

class CustomSurveyModel implements ICustomSurveyModel {
  constructor(private model: Model) {}
  public get onUploadFiles(): ICustomOnUploadFiles {
    return new CustomOnUploadFiles(this.model.onUploadFiles)
  }

  public get onChoicesLazyLoad(): ICustomOnChoicesLazyLoad {
    return new CustomOnChoicesLazyLoad(this.model.onChoicesLazyLoad)
  }
}

export class SuperSurveyModel extends Model implements ISuperSurveyModel {
  constructor(j?: any, c?: any) {
    super(j, c)
  }
  public get custom(): ICustomSurveyModel {
    return new CustomSurveyModel(this)
  }
}
