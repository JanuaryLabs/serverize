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
    <header className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-6">
        <nav className="flex items-center space-x-2 text-sm">
          <span className="text-lg text-gray-500">Blog</span>
          <span className="text-gray-500">&gt;</span>
          <BlogCategory name={category} />
        </nav>

        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {title}
            </h1>

            <p className="mb-6 text-xl text-gray-600">{description}</p>

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
              className="h-[400px] w-full rounded-lg object-cover"
            />
            <div className="absolute bottom-4 right-4 rounded bg-white/80 px-2 py-1 text-sm text-gray-600">
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
