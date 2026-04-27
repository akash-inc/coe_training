let nextWriteShouldFail = false

export function getSimulateWriteFailure(): boolean {
  return nextWriteShouldFail
}

export function setSimulateWriteFailure(value: boolean): void {
  nextWriteShouldFail = value
}

export function consumeSimulatedWriteFailure(): boolean {
  if (!nextWriteShouldFail) {
    return false
  }
  nextWriteShouldFail = false
  return true
}
