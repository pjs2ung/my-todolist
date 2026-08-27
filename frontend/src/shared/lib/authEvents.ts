const listeners = new Set<() => void>()

export function onSessionExpired(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function emitSessionExpired(): void {
  listeners.forEach((listener) => listener())
}
