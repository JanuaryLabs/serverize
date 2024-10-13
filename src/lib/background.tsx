import type React from 'react';

const GridBackground: React.FC = () => (
  <div className="absolute w-full h-full inset-0">
    <div className="absolute w-full h-full inset-0 px-4 py-0 pointer-events-none">
      <div className="flex justify-between items-center h-full max-w-[1080px] mx-auto">
        <div className="bg-white dark:bg-background w-[1px] h-full"></div>
        <div className="border-r border-gray-200 border-dashed h-full"></div>
        <div className="border-r border-gray-200 border-dashed h-full"></div>
        <div className="border-r border-gray-200 border-dashed h-full"></div>
        <div className="bg-white dark:bg-background w-[1px] h-full"></div>
      </div>
    </div>
  </div>
);

const App = ({ children }: React.PropsWithChildren) => {
  return (
    <main className="relative w-full min-h-screen flex items-center justify-center px-4 py-10 bg-white dark:bg-background">
      <div className="flex flex-col items-center w-full z-10">
        <div className="w-full border-b border-dashed border-gray-200"></div>
        <div className="w-full flex flex-col gap-8 justify-center items-center h-full mx-auto py-16 px-4 md:px-16 bg-white dark:bg-background">
          <div className="relative flex flex-col items-center gap-4 justify-center w-full">
            {children}
          </div>
        </div>
        <div className="w-full border-t border-dashed border-gray-200"></div>
      </div>
      <GridBackground />
    </main>
  );
};
export default App;
