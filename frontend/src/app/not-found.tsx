import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="max-w-lg text-center">
        <div className="mb-4 text-6xl">💈</div>

        <h1 className="text-4xl font-bold">Página no encontrada</h1>

        <p className="mt-4 text-slate-400">
          La página que intentas visitar no existe o ya no está disponible.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex rounded-2xl bg-white px-6 py-3 font-semibold text-black"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
