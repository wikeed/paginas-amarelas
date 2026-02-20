import { Avatar } from '@/components/Avatar';

interface PublicProfileHeaderProps {
  username: string;
  name: string | null;
  image: string | null;
}

export function PublicProfileHeader({ username, name, image }: PublicProfileHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 border-b border-border-color">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <Avatar name={username} image={image} size="lg" />

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-1">@{username}</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
