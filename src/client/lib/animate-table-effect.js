module.exports = () => {
  const observer = new IntersectionObserver(callbackFunction, {})
  function callbackFunction (entries) {
    let shownItems = 0
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.style.animationDelay = `${shownItems++ * .03}s`;
      }
      entries[i].target.className += " --shown";
      observer.unobserve(entries[i].target)
      //} else {
      //  entries[i].target.className = entries[i].target.className.replace(' --shown', '');
      //}
    }
  }

  setTimeout(() => {
    const elements = document.querySelectorAll("table.table--animated tbody tr")
    elements.forEach(el => observer.observe(el))
  }, 0)

  return () => {
    const elements = document.querySelectorAll("table.table--animated tbody tr")
    elements.forEach(el => observer.unobserve(el))
  }
}