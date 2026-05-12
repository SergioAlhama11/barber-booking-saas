export default function AppLoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center px-6 overflow-hidden">
      <div className="flex flex-col items-center gap-8">
        {/* Glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 blur-3xl animate-pulse" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center justify-center h-24 w-24 rounded-[2rem] border border-blue-500/20 bg-blue-500/10 backdrop-blur-xl shadow-2xl shadow-blue-500/10">
            <span className="text-5xl animate-pulse">💈</span>
          </div>

          <div className="absolute inset-0 rounded-[2rem] border border-blue-400/20 animate-ping" />
        </div>

        {/* Text */}
        <div className="relative z-10 text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Trimly
          </h1>

          <p className="text-sm tracking-wide text-gray-400 uppercase">
            Preparando tu experiencia
          </p>
        </div>

        {/* Loader */}
        <div className="relative z-10 h-1 w-52 overflow-hidden rounded-full bg-gray-800">
          <div className="loading-bar absolute inset-y-0 w-1/3 rounded-full bg-blue-500" />
        </div>
      </div>
    </div>
  );
}
