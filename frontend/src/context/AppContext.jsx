/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [libraryTab, setLibraryTab] = useState('All');
  const [settingsTab, setSettingsTab] = useState('Player');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  
  const [settings, setSettings] = useState({
    autoPlayNext: true,
    skipIntro: false,
    videoQuality: 'Full HD (1080p)',
    subtitleLanguage: 'English'
  });

  const toggleSetting = (settingKey) => {
    setSettings(prev => ({
      ...prev,
      [settingKey]: !prev[settingKey]
    }));
  };

  const updateSetting = (settingKey, value) => {
    setSettings(prev => ({
      ...prev,
      [settingKey]: value
    }));
  };

  const value = {
    activeTab,
    setActiveTab,
    libraryTab,
    setLibraryTab,
    settingsTab,
    setSettingsTab,
    searchQuery,
    setSearchQuery,
    sidebarExpanded,
    setSidebarExpanded,
    settings,
    toggleSetting,
    updateSetting
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};