export class View {
  constructor() {
    this.buttonStart = document.getElementById('start')
    this.buttonStop = document.getElementById('stop')
    this.buttons = () => Array.from(document.querySelectorAll('button'))

    this.ignoreButtons = new Set(['unassigned'])
    async function onButtonClick() {}
    this.onButtonClick = onButtonClick

    this.DISABLED_BUTTON_TIMEOUT = 500
  }

  onLoad() {
    this.changeCommandButttonsVisibility()
    this.buttonStart.onclick = this.onStartClicked.bind(this)
  }

  changeCommandButttonsVisibility(hide = true) {
    Array
      .from(document.querySelectorAll('[name=command]'))
      .forEach(button => {
        const fn = hide ? 'add' : 'remove'
        button.classList[fn]('unassigned')
        
        function onClickReset() {}
        button.onclick = onClickReset
      })
  }

  configureOnButtonClick(fn) {
    this.onButtonClick = fn
  }

  async onStartClicked({ srcElement: { innerText }}) {
    const buttonText = innerText
    await this.onButtonClick(buttonText)
    this.toggleButtonStart()
    this.changeCommandButttonsVisibility(false)

    this.buttons()
      .filter((button) => this.notIsUnassignedButton(button))
      .forEach(this.setupButtonAction.bind(this))
  }

  setupButtonAction(button) {
    const text = button.innerText.toLowerCase()

    if (text.includes('start')) return

    if (text.includes('stop')) {
      button.onclick = this.onStopButton.bind(this)
      return
    }

    button.onclick = this.onCommandClick.bind(this)
  }

  async onCommandClick(button) {
    const { srcElement: { classList, innerText } } = button

    this.toggleDisableCommandButton(classList)
    await this.onButtonClick(innerText)

    setTimeout(
      () => this.toggleDisableCommandButton(classList),
      this.DISABLED_BUTTON_TIMEOUT
    )
  }

  onStopButton({ srcElement: { innerText } }) {
    this.toggleButtonStart(false)
    this.changeCommandButttonsVisibility(true)

    return this.onButtonClick(innerText)
  }

  toggleDisableCommandButton(classList) {
    if (!classList.contains('active')) {
      classList.add('active')
      return
    }

    classList.remove('active')
  }

  notIsUnassignedButton(button) {
    const buttonClasses = Array.from(button.classList)
    
    const hasIgnoredClasses = Boolean(buttonClasses.find(findButtonClass =>  this.ignoreButtons.has(findButtonClass)))
    
    return !hasIgnoredClasses
  }

  toggleButtonStart(active = true) {
    if (active) {
      this.buttonStart.classList.add('hidden')
      this.buttonStop.classList.remove('hidden')
      return
    }

    this.buttonStart.classList.remove('hidden')
    this.buttonStop.classList.add('hidden')
  }
}