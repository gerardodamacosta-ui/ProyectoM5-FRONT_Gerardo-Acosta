// normaliza texto para comparar sin distinguir mayúsculas/minúsculas ni acentos
// (ej. "Célular" y "celular" deben matchear igual en una búsqueda)
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
