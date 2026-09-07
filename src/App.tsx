import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { WheelListPage } from './routes/WheelListPage'
import { WheelDetailPage } from './routes/WheelDetailPage'
import { TensiometerPage } from './routes/TensiometerPage'
import { SettingsPage } from './routes/SettingsPage'

// GitHub Pages deploys under /wheel-tension-app/; use that as the basename in
// production and "/" in local development so both resolve correctly.
const BASENAME =
  import.meta.env.VITE_GITHUB_PAGES === 'true' ? '/wheel-tension-app' : '/'

export default function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<WheelListPage />} />
          <Route path="wheel/:wheelId" element={<WheelDetailPage />} />
          <Route path="tensiometers" element={<TensiometerPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
