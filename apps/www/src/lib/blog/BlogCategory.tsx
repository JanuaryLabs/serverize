interface BlogCategoryProps {
  name: string;
}

export function BlogCategory({ name }: BlogCategoryProps) {
  return (
    <span className="inline-flex cursor-pointer items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-lg font-medium text-blue-800 transition-colors hover:bg-blue-200">
      {name}
    </span>
  );
}
