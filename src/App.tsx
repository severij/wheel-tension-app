import { RouterProvider } from 'react-router-dom'
import { createAppRouter } from './router'

// GitHub Pages deploys under /wheel-tension-app/; use that as the basename in
// production and "/" in local development so both resolve correctly.
const BASENAME =
  import.meta.env.VITE_GITHUB_PAGES === 'true' ? '/wheel-tension-app' : '/'

const router = createAppRouter({ basename: BASENAME })

export default function App() {
  return <RouterProvider router={router} />
}
