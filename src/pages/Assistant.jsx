import Layout from '../components/Layout'
import AssistantWidget from '../components/AssistantWidget'

export default function Assistant() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto w-full animate-slide-up">
        <AssistantWidget placement="page" mode="page" defaultOpen />
      </div>
    </Layout>
  )
}
