import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ApiService from '../services/api';

const SettingsPage = () => {
  const { settings, updateSettings } = useApp();
  const [activeTab, setActiveTab] = useState('addon-manager');
  const [addons, setAddons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAddons = async () => {
      console.group('⚙️ SettingsPage - Loading Addons');
      try {
        setIsLoading(true);
        
        // Try to load from API first
        console.log('🔍 Fetching addons from API...');
        try {
          const response = await ApiService.getAddons();
          console.log('📋 API response:', response);
          
          if (response && response.addons && response.addons.length > 0) {
            console.log(`✅ Received ${response.addons.length} addons from API`);
            setAddons(response.addons);
            
            // Save to localStorage for future use
            localStorage.setItem('stremio_addons', JSON.stringify(response.addons));
            
            // Update context if available
            if (updateSettings) {
              updateSettings({ addons: response.addons });
            }
            
            setError(null);
          } else {
            console.warn('⚠️ API returned no addons, falling back to localStorage');
            fallbackToLocalStorage();
          }
        } catch (apiError) {
          console.error('❌ API request failed:', apiError);
          console.log('⚠️ Falling back to localStorage');
          fallbackToLocalStorage();
        }
      } catch (error) {
        console.error('❌ Failed to load addons:', error);
        setError(error.message || 'Failed to load addons. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
        console.log('🏁 Addon loading complete');
        console.groupEnd();
      }
    };
    
    const fallbackToLocalStorage = () => {
      // Try to load from localStorage
      const savedAddons = localStorage.getItem('stremio_addons');
      
      if (savedAddons) {
        console.log('📋 Found saved addons in localStorage');
        try {
          const parsedAddons = JSON.parse(savedAddons);
          setAddons(parsedAddons);
          
          // Update context if available
          if (updateSettings) {
            updateSettings({ addons: parsedAddons });
          }
          
          setError(null);
        } catch (parseError) {
          console.error('❌ Failed to parse saved addons:', parseError);
          setError('Failed to load saved addons. Data may be corrupted.');
          setAddons([]);
        }
      } else {
        console.warn('⚠️ No saved addons found in localStorage');
        setAddons([]);
        setError('No addons configured. Add your first addon to start fetching content.');
      }
    };

    loadAddons();
  }, [updateSettings]);

  const handleSyncContent = async () => {
    console.group('🔄 SettingsPage - Syncing Content');
    try {
      setIsLoading(true);
      console.log('🔄 Syncing addons...');
      
      // First sync the addons from the backend
      const syncedAddons = await ApiService.syncAddons();
      console.log(`✅ Synced ${syncedAddons.length} addons`);
      
      // Then sync the library content
      await ApiService.syncLibraryContent();
      console.log('✅ Library content synced');
      
      // Reload addons after sync
      const response = await ApiService.getAddons();
      console.log('📋 API response after sync:', response);
      
      if (response && response.addons) {
        console.log(`✅ Received ${response.addons.length} addons after sync`);
        setAddons(response.addons);
        
        // Save to localStorage
        localStorage.setItem('stremio_addons', JSON.stringify(response.addons));
        
        // Update context if available
        if (updateSettings) {
          updateSettings({ addons: response.addons });
        }
        
        setError(null);
      }
    } catch (error) {
      console.error('❌ Failed to sync content:', error);
      setError(`Failed to sync content: ${error.message}`);
    } finally {
      setIsLoading(false);
      console.log('🏁 Sync operation complete');
      console.groupEnd();
    }
  };

  const handleAddAddon = () => {
    console.log('➕ Adding new addon');
    // Implement add addon functionality
    const addonUrl = prompt('Enter addon URL:');
    if (addonUrl) {
      console.log(`🔍 Installing addon from URL: ${addonUrl}`);
      handleInstallAddon(addonUrl);
    } else {
      console.log('⚠️ Addon URL not provided, installation cancelled');
    }
  };

  const handleInstallAddon = async (addonUrl) => {
    console.group('🔌 SettingsPage - Installing Addon');
    try {
      setIsLoading(true);
      console.log(`🔄 Installing addon from URL: ${addonUrl}`);
      
      // Validate URL format
      let formattedUrl = addonUrl;
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        console.log('🔄 Adding http:// prefix to URL');
        formattedUrl = `http://${formattedUrl}`;
      }
      
      console.log(`🔄 Using formatted URL: ${formattedUrl}`);
      const newAddon = await ApiService.installAddon(formattedUrl);
      console.log('📋 Installation response:', newAddon);
      
      if (newAddon && newAddon.addon) {
        console.log('✅ Addon installed successfully');
        setAddons(prevAddons => [...prevAddons, newAddon.addon]);
        
        // Save updated addons to localStorage
        const updatedAddons = [...addons, newAddon.addon];
        localStorage.setItem('stremio_addons', JSON.stringify(updatedAddons));
        
        // Update context if available
        if (updateSettings) {
          updateSettings({ addons: updatedAddons });
        }
        
        setError(null);
      } else {
        console.error('❌ Invalid response from addon installation');
        setError('Failed to install addon. Invalid response from server.');
      }
    } catch (error) {
      console.error('❌ Failed to install addon:', error);
      setError(error.message || 'Failed to install addon. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
      console.log('🏁 Installation operation complete');
      console.groupEnd();
    }
  };

  const handleToggleAddon = (addonId) => {
    console.group('🔄 SettingsPage - Toggling Addon');
    console.log(`🔄 Toggling addon: ${addonId}`);
    
    // Update state
    const updatedAddons = addons.map(addon => {
      if (addon.id === addonId) {
        console.log(`${addon.enabled ? '🔴 Disabling' : '🟢 Enabling'} addon: ${addon.name}`);
        return { ...addon, enabled: !addon.enabled };
      }
      return addon;
    });
    
    setAddons(updatedAddons);
    
    // Save to localStorage
    localStorage.setItem('stremio_addons', JSON.stringify(updatedAddons));
    console.log('💾 Saved updated addons to localStorage');
    
    // Update context if available
    if (updateSettings) {
      updateSettings({ addons: updatedAddons });
      console.log('🔄 Updated context with new addon settings');
    }
    
    console.log('🏁 Toggle operation complete');
    console.groupEnd();
  };

  const handleRemoveAddon = (addonId) => {
    console.group('🗑️ SettingsPage - Removing Addon');
    console.log(`🗑️ Removing addon: ${addonId}`);
    
    // Find the addon to be removed for logging
    const addonToRemove = addons.find(addon => addon.id === addonId);
    if (addonToRemove) {
      console.log(`🗑️ Removing: ${addonToRemove.name}`);
    }
    
    const updatedAddons = addons.filter(addon => addon.id !== addonId);
    setAddons(updatedAddons);
    
    // Save to localStorage
    localStorage.setItem('stremio_addons', JSON.stringify(updatedAddons));
    console.log('💾 Saved updated addons to localStorage');
    
    // Update context if available
    if (updateSettings) {
      updateSettings({ addons: updatedAddons });
      console.log('🔄 Updated context with new addon settings');
    }
    
    console.log('🏁 Remove operation complete');
    console.groupEnd();
  };

  const getTotalItems = () => {
    return addons.reduce((total, addon) => total + (addon.itemCount || 0), 0);
  };

  const getEnabledAddons = () => {
    return addons.filter(addon => addon.enabled).length;
  };

  const getDisabledAddons = () => {
    return addons.filter(addon => !addon.enabled).length;
  };

  const renderAddonManager = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">Addon Manager</h1>
        <p className="page-description">Manage content sources and fetch new content</p>
      </div>

      {error && (
        <div className="error-message" style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--error-color)',
          borderRadius: '8px',
          color: 'var(--error-color)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={handleSyncContent}>
          <svg className="btn-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
          </svg>
          Sync Content
        </button>
        <button className="btn btn-primary" onClick={handleAddAddon}>
          <svg className="btn-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Add New Addon
        </button>
      </div>

      {/* Content Summary */}
      <div className="content-summary">
        <h3>Content Summary</h3>
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-value">{getTotalItems()}</span>
            <span className="stat-label">Total Items</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value stat-enabled">{getEnabledAddons()}</span>
            <span className="stat-label">Enabled Addons</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value stat-disabled">{getDisabledAddons()}</span>
            <span className="stat-label">Disabled Addons</span>
          </div>
        </div>
        <div className="last-updated">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Configured Addons */}
      <div className="addon-section">
        <h3>Configured Addons ({addons.length}) - {getEnabledAddons()} Enabled</h3>
        
        {addons.length > 0 ? (
          <div>
            {addons.map((addon) => (
              <div key={addon.id} style={{
                padding: '16px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                marginBottom: '12px',
                background: 'var(--secondary-background)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>{addon.name}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{addon.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background: addon.enabled ? 'var(--success-color)' : 'var(--warning-color)',
                      color: 'white'
                    }}>
                      {addon.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                      onClick={() => handleToggleAddon(addon.id)}
                    >
                      {addon.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                      onClick={() => handleRemoveAddon(addon.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg className="empty-state-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <h3 className="empty-state-title">No addons configured</h3>
            <p className="empty-state-description">Add your first addon to start fetching content</p>
            <button className="btn btn-primary" onClick={handleAddAddon}>
              <svg className="btn-icon" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Add First Addon
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderPlayerSettings = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">Player Settings</h1>
        <p className="page-description">Configure your media player preferences</p>
      </div>
      <div className="addon-section">
        <p>Player settings configuration will be implemented here.</p>
      </div>
    </div>
  );

  const renderCatalogs = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">Catalogs</h1>
        <p className="page-description">Manage your content catalogs</p>
      </div>
      <div className="addon-section">
        <p>Catalog management will be implemented here.</p>
      </div>
    </div>
  );

  const renderApiKeys = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">API Keys</h1>
        <p className="page-description">Configure your external service API keys</p>
      </div>
      <div className="addon-section">
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
            TMDB API Key
          </label>
          <input
            type="password"
            placeholder="Enter your TMDB API key"
            value={settings.tmdbApiKey || ''}
            onChange={(e) => updateSettings({ tmdbApiKey: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--secondary-background)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
            Trakt Client ID
          </label>
          <input
            type="text"
            placeholder="Enter your Trakt client ID"
            value={settings.traktClientId || ''}
            onChange={(e) => updateSettings({ traktClientId: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--secondary-background)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
            MDBList API Key
          </label>
          <input
            type="password"
            placeholder="Enter your MDBList API key"
            value={settings.mdblistApiKey || ''}
            onChange={(e) => updateSettings({ mdblistApiKey: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--secondary-background)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderExternalServices = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">External Services</h1>
        <p className="page-description">Configure external media services and players</p>
      </div>
      <div className="addon-section">
        <p>External services configuration will be implemented here.</p>
      </div>
    </div>
  );

  const renderGeneral = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">General Settings</h1>
        <p className="page-description">Configure general application preferences</p>
      </div>
      <div className="addon-section">
        <p>General settings configuration will be implemented here.</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'addon-manager':
        return renderAddonManager();
      case 'player-settings':
        return renderPlayerSettings();
      case 'catalogs':
        return renderCatalogs();
      case 'api-keys':
        return renderApiKeys();
      case 'external-services':
        return renderExternalServices();
      case 'general':
        return renderGeneral();
      default:
        return renderAddonManager();
    }
  };

  return (
    <div className="content-container">
      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Settings Navigation Sidebar */}
        <div style={{ 
          minWidth: '200px', 
          background: 'var(--card-background)', 
          borderRadius: '12px', 
          padding: '20px 0',
          height: 'fit-content',
          border: '1px solid var(--border-color)'
        }}>
          <h3 style={{ 
            padding: '0 20px 20px', 
            borderBottom: '1px solid var(--border-color)',
            color: 'var(--text-primary)'
          }}>
            Settings
          </h3>
          
          {[
            { id: 'addon-manager', label: 'Addon Manager', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> },
            { id: 'player-settings', label: 'Player Settings', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> },
            { id: 'catalogs', label: 'Catalogs', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path></svg> },
            { id: 'api-keys', label: 'API Keys', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7h2a2 2 0 012 2v10a2 2 0 01-2 2h-2m-6 0H7a2 2 0 01-2-2V9a2 2 0 012-2h2m4-4h2a2 2 0 012 2v2H9V5a2 2 0 012-2h2z"></path></svg> },
            { id: 'external-services', label: 'External Services', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9M3 12a9 9 0 019-9m-9 9a9 9 0 009 9m-9-9h18"></path></svg> },
            { id: 'general', label: 'General', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '15px 20px',
                borderRadius: '0',
                border: 'none',
                background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === tab.id ? 'var(--button-text-primary)' : 'var(--text-secondary)',
                fontSize: '14px'
              }}
            >
              <span className="btn-icon" style={{ marginRight: '12px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div style={{ flex: 1 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;