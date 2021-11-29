import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps (ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render () {
    return (
      <Html lang='en' data-fx-crt='false' data-fx-crt-text='false' data-fx-crt-text-animated='false'>
        <Head />
        <script dangerouslySetInnerHTML={{
          __html: `
          document.oncontextmenu = (e) => e.preventDefault()
        `
        }}
        />
        <body className='not-selectable'>
          <div className='layout__background' />
          <div className='layout__overlay' />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
