import { Clock } from 'lucide-react';
import { AuthorInfo } from './AuthorInfo';
import { BlogCategory } from './BlogCategory';

interface BlogHeaderProps {
  category: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  author: {
    name: string;
    role: string;
  };
  imageUrl: string;
  imageCredit: {
    name: string;
    platform: string;
    url: string;
  };
}

export function BlogHeader({
  category,
  title,
  description,
  date,
  readTime,
  author,
  imageUrl,
  imageCredit,
}: BlogHeaderProps) {
  return (
    <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col space-y-6">
        <nav className="flex items-center space-x-2 text-sm">
          <span className="text-gray-500 text-lg">Blog</span>
          <span className="text-gray-500">&gt;</span>
          <BlogCategory name={category} />
        </nav>

        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4">
              {title}
            </h1>

            <p className="text-xl text-gray-600 mb-6">{description}</p>

            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <time dateTime={date}>{date}</time>
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>{readTime} read</span>
                </div>
                <BlogCategory name={category} />
              </div>
              <AuthorInfo {...author} />
            </div>
          </div>

          <div className="relative">
            <img
              src={imageUrl}
              alt="Blog header"
              className="w-full h-[400px] object-cover rounded-lg"
            />
            <div className="absolute bottom-4 right-4 text-sm text-gray-600 bg-white/80 px-2 py-1 rounded">
              Photo Credit:{' '}
              <a
                href={imageCredit.url}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {imageCredit.name}
              </a>
              /{imageCredit.platform}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
