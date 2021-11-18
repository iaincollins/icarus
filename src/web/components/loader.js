
export default function Loader ({ visible }) {
  if (!visible) return null
  return (
    <div id="loader">
      <div className="loader__row">
        <div className="loader__arrow loader__arrow--outer-18"></div>
        <div className="loader__arrow loader__arrow--down lloader__arrow--outer-17"></div>
        <div className="loader__arrow loader__arrow--outer-16"></div>
        <div className="loader__arrow loader__arrow--down loader__arrow--outer-15"></div>
        <div className="loader__arrow loader__arrow--outer-14"></div>
      </div>
      <div className="loader__row">
        <div className="loader__arrow loader__arrow--outer-1"></div>
        <div className="loader__arrow loader__arrow--down loader__arrow--outer-2"></div>
        <div className="loader__arrow loader__arrow--inner-6"></div>
        <div className="loader__arrow loader__arrow--down loader__arrow--inner-5"></div>
        <div className="loader__arrow loader__arrow--inner-4"></div>
        <div className="loader__arrow loader__arrow--down loader__arrow--outer-13"></div>
        <div className="loader__arrow loader__arrow--outer-12"></div>
      </div>
      <div className="loader__row">
        <div className="loader__arrow loader__arrow--down loader__arrow--outer-3"></div>
        <div className="loader__arrow loader__arrow--outer-4"></div>
        <div className="loader__arrow loader__arrow--down loader__arrow--inner-1"></div>
        <div className="loader__arrow loader__arrow--inner-2"></div>
        <div className="loader__arrow loader__arrow--down loader__arrow--inner-3"></div>
        <div className="loader__arrow loader__arrow--outer-11"></div>
        <div className="loader__arrow loader__arrow--down loader__arrow--outer-10"></div>
      </div>
      <div className="loader__row">
        <div className="loader__arrow loader__arrow--down loader__arrow--outer-5"></div>
        <div className="loader__arrow loader__arrow--outer-6"></div>
        <div className="loader__arrow loader__arrow--down loader__arrow--outer-7"></div>
        <div className="loader__arrow loader__arrow--outer-8"></div>
        <div className="loader__arrow loader__arrow--down loader__arrow--outer-9"></div>
      </div>
    </div>
  )
}

Loader.defaultProps = {
  visible: true
}