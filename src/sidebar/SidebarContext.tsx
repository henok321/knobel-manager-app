import React, { createContext, useState } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  onOpen: () => {},
  onClose: () => {},
});

const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen, onOpen, onClose }}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarContext;
export { SidebarProvider };
