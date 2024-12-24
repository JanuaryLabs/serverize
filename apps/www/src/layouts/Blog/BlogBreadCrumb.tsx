import { cn } from '../../components/utils';

export default function BlogBreadCrumb(props: { className?: string }) {
  return (
    <div
      className={cn(
        props.className,
        'flex items-center justify-center gap-x-0.5',
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        className="size-4 mr-1"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
        />
      </svg>

      <p className="text-secondary-foreground/60 text-sm mr-0.5">
        Blog
        <div>/</div>
      </p>
      {/* <p className="text-sm font-medium">Guides</p> */}
      <p className="text-sm font-medium">Guides</p>
    </div>
  );
}
