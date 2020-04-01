window.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('input[type=text], input[type=password]').forEach(element => {
    const label = document.querySelector("label[for=\"" + element.name +"\"]")
    if (label) {
      element.placeholder = label.textContent
    }
  })
}, false)
