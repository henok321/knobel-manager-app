import SidebarContent from './SidebarContent.tsx';
import Header from './Header.tsx';
import { DrawerContent, DrawerRoot } from '../components/ui/drawer.tsx';

interface SidebarProps {
  onClose: () => void;
  onOpen: () => void;
  isOpen: boolean;
}

const Sidebar = ({ onClose, onOpen, isOpen }: SidebarProps) => (
  <div>
    <SidebarContent
      onClose={() => onClose}
      display={{ base: 'none', md: 'block' }}
    />
    <DrawerRoot
      open={isOpen}
      placement="start"
      onOpenChange={onClose}
      size="full"
    >
      <DrawerContent>
        <SidebarContent onClose={onClose} />
      </DrawerContent>
    </DrawerRoot>
    <Header onOpen={onOpen} />
  </div>
);

export default Sidebar;
