'use client'

// React
import { useEffect, useMemo, useState } from 'react'
// Survey
import { Survey } from 'survey-react-ui'
import { Model } from 'survey-core'
import { theme } from '../models/_theme'
// Models
import { surveyJson } from '../models/example'

export default function InputSurvey() {
  const svy = useMemo(() => new Model(surveyJson), [])
  svy.applyTheme(theme)

  // States
  const [survey, setSurvey] = useState<Model | null>(null)

  useEffect(() => {
    setSurvey(svy)
  }, [svy, survey])

  return (
    <div className="bg-gray-100 p-6 flex flex-col gap-4">
      <Survey model={svy} />
    </div>
  )
}
