import { Folder, FolderClosed, FolderOpen } from 'lucide-react';
import { TreeView } from '../../components/tree-view';

export default function GuideTree() {
  return (
    <TreeView
      className="prose"
      data={[
        {
          id: '1',
          name: 'Dockerfile',
          icon: Folder,
          openIcon: FolderOpen,
        },
        {
          id: '2',
          name: '.dockerignore',
          icon: Folder,
          openIcon: FolderOpen,
        },
      ]}
    />
  );
}
