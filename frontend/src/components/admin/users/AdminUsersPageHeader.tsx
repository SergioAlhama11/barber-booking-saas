type Props = {
  onCreateUser: () => void;
};

export default function AdminUsersPageHeader({ onCreateUser }: Props) {
  return (
    <section>
      <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
        USUARIOS
      </p>

      <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Gestión de usuarios
          </h1>

          <p className="mt-2 text-slate-400">
            Administra los accesos internos de Trimly.
          </p>
        </div>

        <button
          onClick={onCreateUser}
          className="
            inline-flex
            h-12
            items-center
            justify-center
            rounded-2xl
            bg-cyan-300
            px-5
            text-sm
            font-semibold
            text-slate-950
            transition
            hover:bg-cyan-200
          "
        >
          + Nuevo usuario
        </button>
      </div>
    </section>
  );
}
