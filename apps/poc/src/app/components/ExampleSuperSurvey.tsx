'use client'

// Survey
import { Survey } from 'survey-react-ui'
import {
  CustomizableSurveyModel,
  CustomOnChoiceLazyLoadBuilder,
  CustomOnUploadFilesBuilder,
  DisplayPreviewMode,
  superSurveyTheme,
} from '@muze-library/second-stage-form'
import { jsonSuperSurvey } from '../models/exampleSuperSurvey'

export default function ExampleSuperSurvey() {
  const svy = new CustomizableSurveyModel(jsonSuperSurvey)

  svy.applyTheme(superSurveyTheme)

  const renderPreview = DisplayPreviewMode.make().build()

  svy.mergeData({ car: ['Audi', 'Mercedes-Benz', 'BMW', 'Peugeot'] })
  svy.customize(renderPreview)

  return (
    <div className="bg-gray-100 p-6 flex flex-col gap-4">
      <Survey model={svy} />
    </div>
  )
}
