import { expect, describe, test, beforeEach, jest } from '@jest/globals'
import { JSDOM } from 'jsdom'

import { View } from '../../../public/controller/js/view.js'

describe('#View - test suite for presentation layer', () => {
  const dom = new JSDOM()
  global.document = dom.window.document
  global.window = dom.window

  function makeButtonElement({ text, classList } = { text: '', classList: { add: jest.fn(), remove: jest.fn() } }) {
    return {
      onclick: jest.fn(),
      classList,
      innerText: text
    }
  }

  beforeEach(()=> {
    jest.resetAllMocks()
    jest.clearAllMocks()

    jest.spyOn(document, 'getElementById').mockReturnValue(makeButtonElement())
  })

  test('#changeCommandButttonsVisibility, given hide=true it should add unassigned class and react onclick', () => {
    const view = new View()

    const buttonElement = makeButtonElement()
    jest.spyOn(document, 'querySelectorAll').mockReturnValue([buttonElement])
    
    view.changeCommandButttonsVisibility()

    expect(buttonElement.classList.add).toHaveBeenCalledWith('unassigned')
    expect(buttonElement.onclick.name).toStrictEqual('onClickReset')
    expect(() => buttonElement.onclick()).not.toThrow()
  })

  test('#changeCommandButttonsVisibility, given hide=false it should remove unassigned class and react onclick', () => {
    const view = new View()

    const buttonElement = makeButtonElement()
    jest.spyOn(document, 'querySelectorAll').mockReturnValue([buttonElement])
    
    view.changeCommandButttonsVisibility(false)

    expect(buttonElement.classList.add).not.toHaveBeenCalled()
    expect(buttonElement.classList.remove).toHaveBeenCalledWith('unassigned')
    expect(buttonElement.onclick.name).toStrictEqual('onClickReset')
    expect(() => buttonElement.onclick()).not.toThrow()
  })

  test('#onLoad', () => {
    const view = new View()
    jest.spyOn(view, view.changeCommandButttonsVisibility.name).mockReturnValue()

    view.onLoad()

    expect(view.changeCommandButttonsVisibility).toHaveBeenCalled()
  })
})
