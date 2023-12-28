'use client'

import dynamic from 'next/dynamic'

const ExampleSuperSurvey = dynamic(() => import('../components/ExampleSuperSurvey'), { ssr: false })

export default function SurveyPage() {
  return (
    <>
      <ExampleSuperSurvey />
    </>
  )
}
