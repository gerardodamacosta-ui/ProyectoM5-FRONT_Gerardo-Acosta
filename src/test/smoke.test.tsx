// smoke test trivial: si esto falla, es un problema de configuración del entorno de test,
// no un bug real de código
describe('smoke test', () => {
  it('suma 1 + 1', () => {
    expect(1 + 1).toBe(2)
  })
})
