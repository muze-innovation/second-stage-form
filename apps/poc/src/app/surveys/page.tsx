// Survey Components
import Link from 'next/link'
import InputSurvey from '../components/InputSurvey'

export default function SurveyPage() {
  return (
    <>
      <div className="mb-10">
        <Link href="/" className="p-4 border border-blue-700 rounded-lg">
          Back to Home
        </Link>
      </div>
      <InputSurvey />
    </>
  )
}
