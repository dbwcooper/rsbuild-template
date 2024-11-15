import { createFileRoute } from '@tanstack/react-router'
import ViewHome from '@/view/home'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return <ViewHome />
}
