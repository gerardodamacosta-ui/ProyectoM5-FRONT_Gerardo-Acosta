// error de negocio conocido: mensaje apto para mostrar en UI + contexto de dónde ocurrió
// permite diferenciar en los catch un error ya manejado de un error inesperado
export class AppError extends Error {
  readonly context: string

  constructor(message: string, context: string) {
    super(message)
    this.name = 'AppError'
    this.context = context
  }
}
