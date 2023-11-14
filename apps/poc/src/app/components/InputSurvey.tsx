'use client'

// React
import { useEffect, useMemo, useState } from 'react'
// Survey
import { Survey } from 'survey-react-ui'
import { Model } from 'survey-core'
// Models
import { surveyJson } from '../models/example'

export default function InputSurvey() {
  const svy = useMemo(() => new Model(surveyJson), [])

  // States
  const [survey, setSurvey] = useState<Model | null>(null)

  useEffect(() => {
    setSurvey(svy)
  }, [svy, survey])

  return (
    <div className="bg-slate-400 p-6 flex flex-col gap-4">
      <div>Survey Input</div>
      <Survey model={svy} />
    </div>
  )
}
