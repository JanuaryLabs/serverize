import type { PropsWithChildren } from 'react';

const siteConfig = {
  links: {
    twitter: 'https://twitter.com/shadcn',
    github: 'https://github.com/shadcn/ui',
  },
};
export default function Footer() {
  return (
    <footer className="px-safe bottom-0 z-10 w-full overflow-hidden py-[17px] md:py-3.5">
      <div className="text-14 container mx-auto flex items-center leading-none sm:text-center md:justify-start md:gap-y-2 lg:flex-wrap lg:justify-between lg:gap-y-3">
        <p>
          <span>© 2024 Januarylabs Inc. All rights reserved.</span>
        </p>

        <ul className="flex gap-x-4.5 sm:justify-center">
          <SocialLink link="https://linkedin.com/company/Januarylabs/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="#0a66c2"
              className="mercado-match"
              data-supported-dps="24x24"
              viewBox="0 0 24 24"
            >
              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
            </svg>
          </SocialLink>
          <SocialLink link="https://discord.gg/aj9bRtrmNt">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 127.14 96.36"
              fill="#5865F2"
              className="size-6"
            >
              <g data-name="图层 2">
                <g data-name="Discord Logos">
                  <path
                    d="M107.7 8.07A105.15 105.15 0 0081.47 0a72.06 72.06 0 00-3.36 6.83 97.68 97.68 0 00-29.11 0A72.37 72.37 0 0045.64 0a105.89 105.89 0 00-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0032.17 16.15 77.7 77.7 0 006.89-11.11 68.42 68.42 0 01-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0064.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 01-10.87 5.19 77 77 0 006.89 11.1 105.25 105.25 0 0032.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15zM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69z"
                    data-name="Discord Logo - Large - White"
                  ></path>
                </g>
              </g>
            </svg>
          </SocialLink>
        </ul>
      </div>
    </footer>

    // <footer className="py-6 md:px-8 md:py-0">
    //   <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
    //     <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
    //       Built by{' '}
    //       <a
    //         href={siteConfig.links.twitter}
    //         target="_blank"
    //         rel="noreferrer"
    //         className="font-medium underline underline-offset-4"
    //       >
    //         shadcn
    //       </a>
    //       . The source code is available on{' '}
    //       <a
    //         href={siteConfig.links.github}
    //         target="_blank"
    //         rel="noreferrer"
    //         className="font-medium underline underline-offset-4"
    //       >
    //         GitHub
    //       </a>
    //       .
    //     </p>
    //   </div>
    // </footer>
  );
}

function SocialLink(
  props: PropsWithChildren<{
    link: string;
  }>,
) {
  return (
    <li>
      <a
        className="transition-colors duration-200"
        href={props.link}
        aria-label="Twitter"
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.children}
      </a>
    </li>
  );
}
