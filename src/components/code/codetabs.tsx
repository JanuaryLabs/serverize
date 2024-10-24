import { parseFromString } from 'dom-parser';
import type { PropsWithChildren } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';

function splitDivs(element: string) {
  const doc = parseFromString(element);
  const divs = doc.getElementsByClassName('split');
  return Array.from(divs)
    .map((div) => div.innerHTML)
    .flat();
}

export default function CodeTabs(props: PropsWithChildren) {
  //   console.log((props.children as ReactElement).props.value);
  const divs = splitDivs((props.children as any).props?.value);
  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">{props.children}</TabsContent>
      <TabsContent value="password">Change your password here.</TabsContent>
    </Tabs>
  );
}
export function CodeTab(props: PropsWithChildren) {
  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">{props.children}</TabsContent>
      <TabsContent value="password">Change your password here.</TabsContent>
    </Tabs>
  );
}
