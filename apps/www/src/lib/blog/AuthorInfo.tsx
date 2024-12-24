import React from 'react';

interface AuthorInfoProps {
  name: string;
  role: string;
}

export function AuthorInfo({ name, role }: AuthorInfoProps) {
  return (
    <div>
      <h3 className="text-blue-600 font-medium hover:text-blue-700 cursor-pointer">
        {name}
      </h3>
      <p className="text-sm text-gray-600">{role}</p>
    </div>
  );
}
