import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from './utils';
import type { Tab } from '../lib/blog/tabs';
import { buttonVariants } from './ui/button';

export const Tabs = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
  activeTab,
}: {
  tabs: Tab[];
  activeTab?: string;
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
}) => {
  const [active, setActive] = useState<Tab>(
    propTabs.find((it) => activeTab === it.href) ?? propTabs[0],
  );
  const [tabs, setTabs] = useState<Tab[]>(propTabs);
  useEffect(() => {
    console.log(activeTab);
    // if (activeTab) return;
    moveSelectedTabToTop(
      propTabs.findIndex((it) => location.pathname === `/blog/${it.href}`),
    );
  }, []);

  const moveSelectedTabToTop = (idx: number) => {
    const newTabs = [...propTabs];
    const selectedTab = newTabs.splice(idx, 1);
    newTabs.unshift(selectedTab[0]);
    setTabs(newTabs);
    setActive(newTabs[0]);
    return newTabs[0];
  };

  const [hovering, setHovering] = useState(false);

  return (
    <div className="[perspective:1000px] relative">
      <div
        className={cn(
          'flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full',
          containerClassName,
        )}
      >
        {propTabs.map((tab, idx) => (
          <a
            key={tab.title}
            href={`/blog/${tab.href}`}
            onClick={() => {
              moveSelectedTabToTop(idx);
            }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={cn(
              'relative',
              buttonVariants({
                variant: 'ghost',
              }),
              'rounded-full',
              tabClassName,
            )}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {active.href === tab.href ? (
              <>
                <motion.div
                  layoutId="clickedbutton"
                  transition={{ type: 'spring', bounce: 0.1, duration: 0.5 }}
                  className={cn(
                    'absolute inset-0',
                    buttonVariants(),
                    'rounded-full',
                    activeTabClassName,
                  )}
                />
                <span
                  className={cn('relative block', 'text-primary-foreground')}
                >
                  {tab.title}
                </span>
              </>
            ) : (
              <span className={cn('relative block')}>{tab.title}</span>
            )}
          </a>
        ))}
      </div>
      <FadeInDiv
        tabs={tabs}
        active={active}
        key={active.href}
        hovering={hovering}
        className={cn('mt-32', contentClassName)}
      />
    </div>
  );
};

export const FadeInDiv = ({
  className,
  tabs,
  hovering,
}: {
  className?: string;
  key?: string;
  tabs: Tab[];
  active: Tab;
  hovering?: boolean;
}) => {
  const isActive = (tab: Tab) => {
    return tab.href === tabs[0].href;
  };
  return (
    <div className="relative w-full h-full">
      {tabs.map((tab, idx) => (
        <motion.div
          key={tab.href}
          layoutId={tab.href}
          style={{
            scale: 1 - idx * 0.1,
            top: hovering ? idx * -50 : 0,
            zIndex: -idx,
            opacity: idx < 3 ? 1 - idx * 0.1 : 0,
          }}
          animate={{
            y: isActive(tab) ? [0, 40, 0] : 0,
          }}
          className={cn('w-full h-full absolute top-0 left-0', className)}
        >
          <DummyContent />
          {/* {tab.content} */}
        </motion.div>
      ))}
    </div>
  );
};

export const DummyContent = () => {
  return (
    <img
      src="https://ui.aceternity.com/_next/image?url=/linear.webp&w=2048&q=75"
      alt="dummy image"
      width="1000"
      height="1000"
      className="object-cover object-left-top h-[60%]  md:h-[90%] absolute -bottom-10 inset-x-0 w-[90%] rounded-xl mx-auto"
    />
  );
};
