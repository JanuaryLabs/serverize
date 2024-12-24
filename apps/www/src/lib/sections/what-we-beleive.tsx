export function WhatWeBelieve() {
  return (
    <div className="mx-auto max-w-xl items-center">
      <div className="md:text-center">
        <p className="mb-12 hidden text-lg md:block">We want to</p>
        <h2 className="mb-12 text-4xl font-bold tracking-normal">
          Minimize <span className="text-red-600">friction</span> between
          <span className="text-blue-700"> development</span> and <span className="text-green-700">deployment</span>
        </h2>
        <p className="text-lg">
          {/* Deploy your development setup as is to the cloud, no scalling drama or
        vendors demands, as long as you have that dockerfile, everything is to
        work same way on your device. */}
          {/* You need to deploy your development enviornment to get feedback, demo a feature or share a latest update and it should be smooth and light without having to set a server and do the boot work. you can do */}
          {/* Serverize makes your local setup available in the cloud. You need a
          dockerfile and terminal. Serverize builds your image, deploys it, and
          sends you the access details. We build it to make the feedback process
          and testing easier and ligher, for developers, testing engineer and
          stackholders. */}
        </p>
        {/* <p className="text-lg">
          With serverize you don't need to make your own development and testing
          enviornments.
        </p> */}
        <p className="text-lg">
          <span className="font-bold text-green-900">
            All you need is a Dockerfile and a terminal.
          </span>{' '}
          Serverize builds your image, deploys it, and sends you the access
          details. It’s built to make feedback, testing, and sharing updates
          smooth and lightweight.
        </p>
        <p className="mt-4 text-lg font-semibold text-secondary-foreground/70">
          You don’t need to create your own development or testing environments.
          That's what Serverize is for.
        </p>
      </div>
    </div>
  );
}
