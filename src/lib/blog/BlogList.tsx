import { BlogTile, type Guide } from './BlogTile';

export default function BlogList(props: { guides: Guide[] }) {
  return (
    <div className="max-w-screen-xl w-full mx-auto flex">
      <div className="lg:block hidden border-[0.5px]"></div>
      <div className="lg:mx-8 mx-4"></div>
      <ul className="flex flex-col gap-y-8 mt-8 w-full max-w-3xl">
        {props.guides.map((it) => (
          <BlogTile key={it.title} {...it} />
        ))}
      </ul>
    </div>
  );
}
