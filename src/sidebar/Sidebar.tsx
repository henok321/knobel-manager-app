import SidebarContent from './SidebarContent.tsx';
import { Drawer, DrawerContent } from '@chakra-ui/react';
import Header from './Header.tsx';

interface SidebarProps {
  onClose: () => void;
  onOpen: () => void;
  isOpen: boolean;
}

const Sidebar = ({ onClose, onOpen, isOpen }: SidebarProps) => (
  <>
    <SidebarContent
      onClose={() => onClose}
      display={{ base: 'none', md: 'block' }}
    />
    <Drawer
      isOpen={isOpen}
      placement="left"
      onClose={onClose}
      returnFocusOnClose={false}
      onOverlayClick={onClose}
      size="full"
    >
      <DrawerContent>
        <SidebarContent onClose={onClose} />
      </DrawerContent>
    </Drawer>
    <Header onOpen={onOpen} />
  </>
);

export default Sidebar;
