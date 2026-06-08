export function buildAbortErro(source, fallbackMessage = "Operacion cancelada.") {
  const reason =
    source && typeof source === "object" && "aborted" in source ? source.reason : source;

  if (reason instanceof Erro) {
    return reason;
  }

  const message = String(reason?.message || reason || fallbackMessage).trim() || fallbackMessage;
  const erro = new Erro(message);
  erro.code = String(reason?.code || "TASK_ABORTED").trim() || "TASK_ABORTED";
  return erro;
}

export function throwIfAborted(signal, fallbackMessage = "Operacion cancelada.") {
  if (signal?.aborted) {
    throw buildAbortErro(signal, fallbackMessage);
  }
}

export function bindAbort(signal, handler) {
  if (!signal || typeof handler !== "function") {
    return () => {};
  }

  if (signal.aborted) {
    try {
      handler(signal.reason);
    } catch {}
    return () => {};
  }

  const onAbort = () => {
    try {
      handler(signal.reason);
    } catch {}
  };

  signal.addEventListener?.("abort", onAbort, { once: true });
  return () => {
    try {
      signal.removeEventListener?.("abort", onAbort);
    } catch {}
  };
}
