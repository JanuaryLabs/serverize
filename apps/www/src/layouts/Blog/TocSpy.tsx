import { useEffect } from 'react';

export default function TocSpy() {
  useEffect(() => {
    const onScroll = () => {
      const items = document.querySelectorAll(`li[data-heading]`);
      const [header] = new Set(
        Array.from(document.querySelectorAll('article h1,h2,h3')).filter(
          isElementVisible,
        ),
      );
      if (!header) return;
      const item = document.querySelector(`li[data-heading="#${header.id}"]`);
      console.log(header.id);
      if (!item) return;
      items.forEach((item) => {
        item.classList.remove('active');
        (item as HTMLElement).dataset.active = 'false';
      });
      item.classList.add('active');
      (item as HTMLElement).dataset.active = 'true';
      const nextElVisible = ['H1', 'H2', 'H3'].includes(
        header.nextElementSibling?.tagName || '',
      )
        ? isElementVisible(header.nextElementSibling!)
        : false;

      if (!nextElVisible) {
        item.classList.add('active');
        (item as HTMLElement).dataset.active = 'true';
      }
    };
    document.addEventListener('scroll', onScroll);
    setTimeout(onScroll, 100);
  }, []);
  return <></>;
}

function isElementVisible(el: Element) {
  const rect = el.getBoundingClientRect(),
    vWidth = window.innerWidth || document.documentElement.clientWidth,
    vHeight = window.innerHeight || document.documentElement.clientHeight,
    efp = (x: number, y: number) => {
      return document.elementFromPoint(x, y);
    };

  // Return false if it's not in the viewport
  if (
    rect.right < 0 ||
    rect.bottom < 0 ||
    rect.left > vWidth ||
    rect.top > vHeight
  )
    return false;

  // Return true if any of its four corners are visible
  return (
    el.contains(efp(rect.left, rect.top)) ||
    el.contains(efp(rect.right, rect.top)) ||
    el.contains(efp(rect.right, rect.bottom)) ||
    el.contains(efp(rect.left, rect.bottom))
  );
}
