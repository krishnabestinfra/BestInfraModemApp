import React, { createContext, useContext, useMemo, useState } from 'react';

const SidebarContext = createContext({
  activeItem: 'Dashboard',
  setActiveItem: () => {},
});

export const SidebarProvider = ({ children }) => {
  const [activeItem, setActiveItem] = useState('Dashboard');

  const value = useMemo(
    () => ({
      activeItem,
      setActiveItem,
    }),
    [activeItem]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => useContext(SidebarContext);

export default SidebarContext;

