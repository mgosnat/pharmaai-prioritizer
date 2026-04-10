import { Routes, Route } from 'react-router-dom'
import PrioritizerPage from './pages/PrioritizerPage'
import PrioritizerPageFR from './pages/PrioritizerPageFR'
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PrioritizerPage />} />
      <Route path="/fr" element={<PrioritizerPageFR />} />
    </Routes>
  )
}
