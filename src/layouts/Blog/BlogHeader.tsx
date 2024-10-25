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
    <div className="justify-center flex flex-col gap-y-2 lg:gap-y-4">
      {/* <BlogBreadCrumb className="mt-8" /> */}
      
      <h1 className=" text-center font-bold lg:text-5xl md:text-3xl text-2xl mb-0">
        {props.title}
      </h1>
      <div className="flex text-sm gap-x-1 justify-center">
        <p>{props.author}</p>
        <p className="text-secondary-foreground/60">Software Engineer</p>
      </div>
      <div className="flex text-sm items-center justify-between">
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
        className="text-2xl font-medium text-secondary-foreground/70"
      >
        {props.subtitle}
      </h2>
    </div>
  );
}
