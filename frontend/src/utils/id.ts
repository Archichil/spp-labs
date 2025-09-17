export function generateId(prefix: string = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${(crypto as Crypto).randomUUID()}`
  }
  const randomPart = Math.random().toString(36).slice(2)
  const timePart = Date.now().toString(36)
  return `${prefix}-${timePart}-${randomPart}`
}


