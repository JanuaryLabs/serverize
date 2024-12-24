export interface Guide {
  title: string;
  subtitle: string;
  href: string;
  headings: Array<{
    title: string;
    href: string;
    level: number;
  }>;
}
export function BlogTile(props: Guide) {
  return (
    <li>
      <a href={props.href} className="group">
        <h3 className="text-xl font-semibold group-hover:underline">
          {props.title}
        </h3>
        <p className="text-secondary-foreground/70">{props.subtitle}</p>
      </a>
    </li>
  );
}
