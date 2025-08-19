/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  
  // Initialize settings from localStorage if available
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('app_settings');
    const savedAddons = localStorage.getItem('stremio_addons');
    
    const defaultSettings = {
      autoPlayNext: true,
      skipIntro: false,
      videoQuality: 'Full HD (1080p)',
      subtitleLanguage: 'English',
      tmdbApiKey: localStorage.getItem('tmdb_api_key') || '',
      traktClientId: localStorage.getItem('trakt_client_id') || '',
      mdblistApiKey: localStorage.getItem('mdblist_api_key') || '',
      addons: savedAddons ? JSON.parse(savedAddons) : []
    };
    
    return savedSettings ? {...defaultSettings, ...JSON.parse(savedSettings)} : defaultSettings;
  });
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    
    // Also save addons separately for backward compatibility
    if (settings.addons) {
      localStorage.setItem('stremio_addons', JSON.stringify(settings.addons));
    }
  }, [settings]);

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
  
  const updateSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
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
    updateSetting,
    updateSettings
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};