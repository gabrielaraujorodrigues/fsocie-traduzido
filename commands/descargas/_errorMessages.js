function parseRawErro(erro, fallback = "No se pudo completar la solicitud.") {
  let text = String(erro?.message || erro || fallback).trim();

  try {
    const parsed = JSON.parse(text);
    text = String(parsed?.detail || parsed?.message || text).trim();
  } catch {}

  return text || fallback;
}

export function sanitizeProviderMessage(erro, options = {}) {
  const kind = String(options?.kind || "download").trim().toLowerCase();
  const fallback = String(options?.fallback || "No se pudo completar la solicitud.").trim();
  const raw = parseRawErro(erro, fallback);
  const normalized = raw.toLowerCase();

  const busyLabel =
    kind === "vídeo"
      ? "No pude procesar el vídeo en este intento. Retente en un momento."
      : kind === "áudio"
      ? "No pude procesar el áudio en este intento. Retente en un momento."
      : kind === "search"
      ? "No pude completar la busca en este intento. Retente en un momento."
      : "No pude completar la solicitud en este intento. Retente en un momento.";

  if (
    normalized.includes("rate-overlimit") ||
    normalized.includes("rate overlimit") ||
    normalized.includes("too many requests") ||
    normalized.includes("http 429") ||
    normalized === "429"
  ) {
    return busyLabel;
  }

  if (
    normalized.includes("timeout") ||
    normalized.includes("timed out") ||
    normalized.includes("econnaborted")
  ) {
    if (kind === "search") {
      return "La busca tardo demais. Tente otra vez en unos segundos.";
    }
    return "El servidor tardo demais en respondar. Tente otra vez.";
  }

  if (
    normalized.includes("socket hang up") ||
    normalized.includes("econnreset") ||
    normalized.includes("service unavailable") ||
    normalized.includes("temporarily unavailable") ||
    normalized.includes("aggregateerro")
  ) {
    return "El servidor esta temporalmente inestable. Tente otra vez.";
  }

  if (normalized.includes("403") || normalized.includes("forbidden")) {
    return "El proveedor bloqueo temporalmente la solicitud. Tente otra vez.";
  }

  if (normalized.includes("404") || normalized.includes("not found")) {
    if (kind === "search") {
      return "No se encontraron resultados para esa busca.";
    }
    return "No se encontro el archivo o link solicitado.";
  }

  if (
    normalized.includes("http 500") ||
    normalized.includes("http 502") ||
    normalized.includes("http 503") ||
    normalized.includes("http 504")
  ) {
    return "El proveedor falha temporalmente. Tente otra vez en unos minutos.";
  }

  return raw;
}
