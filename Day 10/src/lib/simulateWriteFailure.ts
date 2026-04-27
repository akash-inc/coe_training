let simulateWriteFailure = false

export function getSimulateWriteFailure(): boolean {
  return simulateWriteFailure
}

export function setSimulateWriteFailure(value: boolean): void {
  simulateWriteFailure = value
}
