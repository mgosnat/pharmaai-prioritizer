import { Routes, Route } from 'react-router-dom'
import PrioritizerPage from './pages/PrioritizerPage'
export default function App() {
  return <Routes><Route path="*" element={<PrioritizerPage />} /></Routes>
}
