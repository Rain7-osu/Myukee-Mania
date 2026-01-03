async function sleep(time: number): Promise<unknown> {
  return new Promise(resolve => setTimeout(resolve, time))
}

export function $(id: string): HTMLElement | null {
  return document.getElementById(id)
}

export function bindClick(btnId: string, handler: (e: Event) => void): void {
  $(btnId)?.addEventListener('click', handler)
}
