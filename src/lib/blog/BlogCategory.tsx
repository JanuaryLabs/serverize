import React from 'react';

interface BlogCategoryProps {
  name: string;
}

export function BlogCategory({ name }: BlogCategoryProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-lg font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer transition-colors">
      {name}
    </span>
  );
}
