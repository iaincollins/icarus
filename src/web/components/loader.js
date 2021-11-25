
export default function Loader ({ visible }) {
  return (
    <div id='loader' style={{ opacity: visible ? .75 : 0 }}>
      <div className='loader__row'>
        <div className='loader__arrow loader__arrow--outer-18' />
        <div className='loader__arrow loader__arrow--down lloader__arrow--outer-17' />
        <div className='loader__arrow loader__arrow--outer-16' />
        <div className='loader__arrow loader__arrow--down loader__arrow--outer-15' />
        <div className='loader__arrow loader__arrow--outer-14' />
      </div>
      <div className='loader__row'>
        <div className='loader__arrow loader__arrow--outer-1' />
        <div className='loader__arrow loader__arrow--down loader__arrow--outer-2' />
        <div className='loader__arrow loader__arrow--inner-6' />
        <div className='loader__arrow loader__arrow--down loader__arrow--inner-5' />
        <div className='loader__arrow loader__arrow--inner-4' />
        <div className='loader__arrow loader__arrow--down loader__arrow--outer-13' />
        <div className='loader__arrow loader__arrow--outer-12' />
      </div>
      <div className='loader__row'>
        <div className='loader__arrow loader__arrow--down loader__arrow--outer-3' />
        <div className='loader__arrow loader__arrow--outer-4' />
        <div className='loader__arrow loader__arrow--down loader__arrow--inner-1' />
        <div className='loader__arrow loader__arrow--inner-2' />
        <div className='loader__arrow loader__arrow--down loader__arrow--inner-3' />
        <div className='loader__arrow loader__arrow--outer-11' />
        <div className='loader__arrow loader__arrow--down loader__arrow--outer-10' />
      </div>
      <div className='loader__row'>
        <div className='loader__arrow loader__arrow--down loader__arrow--outer-5' />
        <div className='loader__arrow loader__arrow--outer-6' />
        <div className='loader__arrow loader__arrow--down loader__arrow--outer-7' />
        <div className='loader__arrow loader__arrow--outer-8' />
        <div className='loader__arrow loader__arrow--down loader__arrow--outer-9' />
      </div>
    </div>
  )
}

Loader.defaultProps = {
  visible: true
}
