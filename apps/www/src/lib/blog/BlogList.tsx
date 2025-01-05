import { BlogTile, type Guide } from './BlogTile';

export default function BlogList(props: { guides: Guide[] }) {
  return (
    <div className="mx-auto flex w-full lg:max-w-xl 2xl:max-w-screen-xl">
      <div className="hidden border-[0.5px] lg:block"></div>

      <ul className="mx-6 mb-8 mt-8 flex w-full max-w-3xl flex-col gap-y-8 lg:mx-8">
        {props.guides.map((it) => (
          <BlogTile key={it.title} {...it} />
        ))}
      </ul>
    </div>
  );
}
