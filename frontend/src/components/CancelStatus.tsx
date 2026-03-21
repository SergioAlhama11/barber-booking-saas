type Status = "loading" | "success" | "error";

export default function CancelStatus({
  status,
  message,
}: {
  status: Status;
  message?: string;
}) {
  return (
    <div className="p-6 max-w-md mx-auto text-center">
      {status === "loading" && (
        <p className="text-gray-600">Cancelando tu cita...</p>
      )}

      {status === "success" && (
        <div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">
            ✅ Cita cancelada
          </h1>
          <p className="text-gray-600">
            Tu cita ha sido cancelada correctamente.
          </p>
        </div>
      )}

      {status === "error" && (
        <div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            ❌ No se pudo cancelar
          </h1>
          <p className="text-gray-600">
            {message || "El enlace no es válido o ha expirado."}
          </p>
        </div>
      )}
    </div>
  );
}
