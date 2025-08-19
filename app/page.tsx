'use client'

import dynamic from 'next/dynamic'
import { LoadingEmptyState } from '../components/EmptyStates'

// Dynamically import the main app component to avoid SSR issues
const MainApp = dynamic(() => import('../components/MainApp'), {
  loading: () => <LoadingEmptyState message="Loading Toastify..." />,
  ssr: false
})

export default function HomePage() {
  return <MainApp />
}