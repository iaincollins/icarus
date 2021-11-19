import '../css/main.css'
import { Socket } from 'components/socket'

export default function MyApp ({ Component, pageProps }) {
  return (
    <Socket>
      <Component {...pageProps} />
    </Socket>
  )
}
