import { format } from 'date-fns';

export default function GuideHeader(props: {
  title: string;
  subtitle: string;
  author: string;
  date: string;
  minutesRead: string;
}) {
  return (
    <div className="flex flex-col justify-center gap-y-1 lg:gap-y-4">
      <h1 className="mb-0 text-3xl font-bold lg:text-5xl">{props.title}</h1>
      <h2 className="text-secondary-foreground/70 m-0 font-medium md:text-lg">
        {props.subtitle}
      </h2>
      <div className="text-secondary-foreground/70 mt-4 flex items-center text-sm">
        <p className="flex items-center gap-x-1 text-inherit">
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
        <span className="mx-1">/</span>
        <p className="text-inherit">{format(props.date, 'MMM dd, yyyy')}</p>
      </div>
    </div>
  );
}
