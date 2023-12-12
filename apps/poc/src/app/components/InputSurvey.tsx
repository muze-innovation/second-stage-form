'use client'

import 'survey-core/defaultV2.min.css'
// Zod
import { z } from 'zod'
// Survey
import { Survey } from 'survey-react-ui'
import { theme } from '../models/_theme'
import { settings } from 'survey-core'

// Models
import { surveyJson } from '../models/example'
import { SupuerSurveyModel } from '../SupuerSurveyModel'

export default function InputSurvey() {
  settings.showMaxLengthIndicator = false
  // States
  const svy = new SupuerSurveyModel(surveyJson)
  svy.applyTheme(theme)

  const validate = z.object({ lastName: z.string().min(1) })
  svy.onServerValidateQuestions.add((_, otps) => {
    const validated = validate.safeParse(otps.data)

    if (!validated.success) {
      const error = validated.error.formErrors
      const keysOfErrors = Object.keys(error.fieldErrors)
      for (const key of keysOfErrors) {
        const value = (error.fieldErrors as any)[key]?.join(', ')

        otps.errors[key] = value
      }

      otps.complete()
    }
  })
  svy.onValidateQuestion.add((_, otps) => {
    console.log('otps onValidateQuestion =>', otps.question.getAllErrors())
  })
  // function sendRequest(url: string, onloadSuccessCallback: any) {}

  svy.custom.onChoicesLazyLoad.add(async (_, options) => {
    if (options.question.getType() === 'dropdown' && options.question.name === 'country') {
      const url = `https://surveyjs.io/api/CountriesExamplePagination?skip=${options.skip}&take=${options.take}&filter=${options.filter}`
      const resp = await fetch(url, { method: 'GET' })
      const json = await resp.json()
      return {
        data: json.countries,
        totalCount: json.total,
      } as any
    }
  })

  svy.onGetChoiceDisplayValue.add((_, options) => {
    if (options.question.getType() === 'dropdown' && options.question.name === 'country') {
      const valuesStr = options.values.map((value) => 'values=' + value).join('&')
      const url = 'https://surveyjs.io/api/GetCountryNames?' + valuesStr
      // sendRequest(url, (data) => {
      //   options.setItems(data.countryNames)
      // })
    }
  })
  return (
    <div className="bg-gray-100 p-6 flex flex-col gap-4">
      <Survey model={svy} />
    </div>
  )
}
