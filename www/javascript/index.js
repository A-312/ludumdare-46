// Try to prevent bug
window.addEventListener('load', function() {
  const script = document.createElement('script')
  script.setAttribute('async', true)
  script.setAttribute('src', 'javascript/game.js?t=' + (+new Date()))
  document.head.appendChild(script)
})
