async function sleep(time: number): Promise<unknown> {
  return new Promise(resolve => setTimeout(resolve, time))
}

export function $(id: string): HTMLElement | null {
  return document.getElementById(id)
}

export function createHiddenInput() {
  const input = document.createElement('input');
  document.body.appendChild(input)
  input.style = 'width: 100vw; height: 100vh; opacity: 0; position: fixed; left: 0; top: 0; z-index: -1'
  return input
}

export function bindClick(btnId: string, handler: (e: Event) => void): void {
  $(btnId)?.addEventListener('click', handler)
}
