import { format } from 'date-fns';

import BlogBreadCrumb from './BlogBreadCrumb';

export default function BlogHeader(props: {
  title: string;
  subtitle: string;
  author: string;
  date: string;
  minutesRead: string;
}) {
  return (
    <div className="flex flex-col justify-center gap-y-2 lg:gap-y-4">
      {/* <BlogBreadCrumb className="mt-8" /> */}

      <h1 className="mb-0 text-center text-2xl font-bold md:text-3xl lg:text-5xl">
        {props.title}
      </h1>
      <div className="flex justify-center gap-x-1 text-sm">
        <p>{props.author}</p>
        <p className="text-secondary-foreground/60">Software Engineer</p>
      </div>
      <div className="flex items-center justify-between text-sm">
        <p className="text-secondary-foreground/60 flex items-center gap-x-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          {props.minutesRead}
        </p>
        <p className="text-secondary-foreground/60">
          {format(props.date, 'MMM dd, yyyy')}
        </p>
      </div>
      <h2
        style={{
          marginTop: '1em',
        }}
        className="text-secondary-foreground/70 text-2xl font-medium"
      >
        {props.subtitle}
      </h2>
    </div>
  );
}
