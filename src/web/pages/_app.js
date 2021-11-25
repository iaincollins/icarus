import '../css/main.css'
import { Socket } from 'lib/socket'

export default function MyApp ({ Component, pageProps }) {
  return (
    <Socket>
      <Component {...pageProps} />
    </Socket>
  )
}
