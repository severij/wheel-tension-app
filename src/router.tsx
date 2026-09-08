import { Navigate, createBrowserRouter, createMemoryRouter, type RouteObject } from 'react-router-dom'
import { Layout } from './components/Layout'
import { WheelListPage } from './routes/WheelListPage'
import { WheelDetailPage } from './routes/WheelDetailPage'
import { WheelEditPage } from './routes/WheelEditPage'
import { MeasurementDetailPage } from './routes/MeasurementDetailPage'
import { MeasurementEditPage } from './routes/MeasurementEditPage'
import { TensiometerPage } from './routes/TensiometerPage'
import { TensiometerDetailPage } from './routes/TensiometerDetailPage'
import { TensiometerEditPage } from './routes/TensiometerEditPage'
import { CurveDetailPage } from './routes/CurveDetailPage'
import { CurveEditPage } from './routes/CurveEditPage'
import { SettingsPage } from './routes/SettingsPage'
import { SettingsEditPage } from './routes/SettingsEditPage'

export const appRoutes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <WheelListPage /> },
      { path: 'wheel/:wheelId', element: <WheelDetailPage /> },
      { path: 'wheel/:wheelId/edit', element: <WheelEditPage /> },
      { path: 'wheel/:wheelId/set/:setId', element: <MeasurementDetailPage /> },
      { path: 'wheel/:wheelId/set/:setId/edit', element: <MeasurementEditPage /> },
      { path: 'tensiometers', element: <TensiometerPage /> },
      { path: 'tensiometers/:tensiometerId', element: <TensiometerDetailPage /> },
      { path: 'tensiometers/:tensiometerId/edit', element: <TensiometerEditPage /> },
      { path: 'tensiometers/:tensiometerId/:curveId', element: <CurveDetailPage /> },
      { path: 'tensiometers/:tensiometerId/:curveId/edit', element: <CurveEditPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'settings/edit', element: <SettingsEditPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]

export function createAppRouter(
  opts: { basename?: string; initialEntries?: string[] } = {},
) {
  if (opts.initialEntries) {
    return createMemoryRouter(appRoutes, { initialEntries: opts.initialEntries })
  }
  return createBrowserRouter(appRoutes, { basename: opts.basename })
}
