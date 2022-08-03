import type { AppProps } from 'next/app'
import { OverlayProvider } from 'react-aria'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <OverlayProvider>
      <Component {...pageProps} />
    </OverlayProvider>
  )
}

export default MyApp
