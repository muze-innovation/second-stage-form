'use client'

// Survey
import { Survey } from 'survey-react-ui'
import { theme } from '../models/_theme'
import { settings } from 'survey-core'

// Models
import { surveyJson } from '../models/example'
import {
  CustomizableSurveyModel,
  CustomOnChoiceLazyLoadBuilder,
  CustomOnUploadFilesBuilder,
  DisplayPreviewMode,
} from '@muze-library/second-stage-form'

export default function InputSurvey() {
  settings.showMaxLengthIndicator = false
  // States
  const svy = new CustomizableSurveyModel(surveyJson).toPreview(DisplayPreviewMode.make(), {
    province: 'กทม',
    membership: 'ใช่',
    address: 'test',
  })

  // Preview Survey Model
  svy.applyTheme(theme)

  svy.onValidateQuestion.add((_, otps) => {
    console.log('otps onValidateQuestion =>', otps.question.getAllErrors())
  })

  const onUploadFiles = CustomOnUploadFilesBuilder.make()
    .add('*', async (f) => {
      return f.map(
        () =>
          'https://d1pjg4o0tbonat.cloudfront.net/content/dam/toshiba-aem/th/electric-water-boiler/conventional/plk-g33t/gallery2.jpg/jcr:content/renditions/cq5dam.web.5000.5000.jpeg',
      )
    })
    .build()

  const onChoicesLazyLoad = CustomOnChoiceLazyLoadBuilder.make()
    .add({ name: 'province' }, async (s, __) => {
      s.setValue('district', '')
      s.setValue('subdistrict', '')
      s.setValue('zipcode', '')
      const url = 'http://localhost:5100/api/v1/master/addresses/province'
      const resp = await fetch(url, { method: 'GET' })
      const json = await resp.json()

      return {
        data: json.data.map((d: any) => ({ value: d.key, text: d.label })),
        totalCount: json.data.length,
      } as any
    })
    .add({ name: 'district' }, async (s, __) => {
      const province = s.getValue('province')
      s.setValue('subdistrict', '')
      s.setValue('zipcode', '')
      const url = `http://localhost:5100/api/v1/master/addresses/district?provinceCode=${province}`
      const resp = await fetch(url, { method: 'GET' })
      const json = await resp.json()
      return {
        data: json?.data?.map((d: any) => ({ value: d.key, text: d.label })) || [],
        totalCount: json?.data?.length || 0,
      } as any
    })
    .add({ name: 'subdistrict', type: 'dropdown' }, async (s, __) => {
      const province = s.getValue('province')
      const district = s.getValue('district')

      s.setValue('zipcode', '')
      const url = `http://localhost:5100/api/v1/master/addresses/subdistrict?provinceCode=${province}&districtCode=${district}`
      const resp = await fetch(url, { method: 'GET' })
      const json = await resp.json()
      return {
        data: json?.data?.map((d: any) => ({ value: d.key, text: d.label })) || [],
        totalCount: json?.data?.length || 0,
      } as any
    })
    .add({ name: 'zipcode' }, async (s, __) => {
      const province = s.getValue('province')
      const district = s.getValue('district')
      const subdistrict = s.getValue('subdistrict')
      const url = `http://localhost:5100/api/v1/master/addresses/zipcode?provinceCode=${province}&districtCode=${district}&subdistrictCode=${subdistrict}`
      const resp = await fetch(url, { method: 'GET' })
      const json = await resp.json()
      return {
        data: json?.data?.map((d: any) => ({ value: d.key, text: d.label })) || [],
        totalCount: json?.data?.length || 0,
      } as any
    })
    .build()

  svy.customize([onChoicesLazyLoad, onUploadFiles])

  return (
    <div className="bg-gray-100 p-6 flex flex-col gap-4">
      <Survey model={svy} />
    </div>
  )
}
