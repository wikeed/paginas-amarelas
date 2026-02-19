import { AuthForm } from '@/components/AuthForm';

export default function Home() {
  return (
    <main
      className="relative min-h-screen w-full flex items-center justify-center px-4 py-8 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: 'url("/uploads/bg-blur.jpg")',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/70 to-black/75" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="backdrop-blur-md bg-slate-900/40 rounded-2xl shadow-2xl border border-slate-700/50 p-6 sm:p-8 flex items-center justify-center">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
