import { AuthForm } from '@/components/AuthForm';

export default function Home() {
  return (
    <main
      className="relative min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: 'url("/bg-blur.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10">
        <AuthForm />
      </div>
    </main>
  );
}
