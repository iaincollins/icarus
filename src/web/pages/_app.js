import '../css/main.css'
import { SocketProvider } from 'lib/socket'

export default function MyApp ({ Component, pageProps }) {
  return (
    <SocketProvider>
      <Component {...pageProps} />
    </SocketProvider>
  )
}
