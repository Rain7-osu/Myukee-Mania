import { dev } from './dev'

async function sleep (time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time))
}

export function $ (id: string): HTMLElement {
  return document.getElementById(id)
}

export function bindClick (btnId: string, handler: Function): void {
  $(btnId).addEventListener('click', handler)
}
