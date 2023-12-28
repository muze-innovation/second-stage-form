'use client'

import dynamic from 'next/dynamic'
// Survey Components
const InputSurvey = dynamic(() => import('../components/InputSurvey'), { ssr: false })

export default function SurveyPage() {
  return (
    <>
      <InputSurvey />
    </>
  )
}
