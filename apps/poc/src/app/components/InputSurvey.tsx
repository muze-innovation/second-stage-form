'use client'

// Zod
import { z } from 'zod'
// Survey
import { Survey } from 'survey-react-ui'
import { theme } from '../models/_theme'
import { settings } from 'survey-core'

// Models
import { surveyJson } from '../models/example'
import { SuperSurveyModel } from '@muze-library/second-stage-form'

export default function InputSurvey() {
  settings.showMaxLengthIndicator = false
  // States
  const svy = new SuperSurveyModel(surveyJson)
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

  svy.custom.onUploadFiles
    .add('*', async (s) => {
      return 'https://d1pjg4o0tbonat.cloudfront.net/content/dam/toshiba-aem/th/electric-water-boiler/conventional/plk-g33t/gallery2.jpg/jcr:content/renditions/cq5dam.web.5000.5000.jpeg'
    })
    .build()

  svy.custom.onChoicesLazyLoad
    .add({ name: 'province' }, async (_, __) => {
      _.setValue('district', '')
      _.setValue('subdistrict', '')
      _.setValue('zipcode', '')
      const url = 'http://localhost:5100/api/v1/master/addresses/province'
      const resp = await fetch(url, { method: 'GET' })
      const json = await resp.json()

      return {
        data: json.data.map((d: any) => ({ value: d.key, text: d.label })),
        totalCount: json.data.length,
      } as any
    })
    .add({ name: 'district' }, async (_, __) => {
      const province = _.getValue('province')
      _.setValue('subdistrict', '')
      _.setValue('zipcode', '')
      const url = `http://localhost:5100/api/v1/master/addresses/district?provinceCode=${province}`
      const resp = await fetch(url, { method: 'GET' })
      const json = await resp.json()
      return {
        data: json.countries,
        totalCount: json.total,
      } as any
    })
    .build()

  return (
    <div className="bg-gray-100 p-6 flex flex-col gap-4">
      <Survey model={svy} />
    </div>
  )
}
