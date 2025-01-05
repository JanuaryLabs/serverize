import React from 'react';

interface AuthorInfoProps {
  name: string;
  role: string;
}

export function AuthorInfo({ name, role }: AuthorInfoProps) {
  return (
    <div>
      <h3 className="cursor-pointer font-medium text-blue-600 hover:text-blue-700">
        {name}
      </h3>
      <p className="text-sm text-gray-600">{role}</p>
    </div>
  );
}
