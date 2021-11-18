import '../public/css/main.css'
import Loader from 'components/loader'

export default function MyApp({ Component, pageProps }) {
  return <>
    <Loader/>
    <Component {...pageProps}/>
  </>
}