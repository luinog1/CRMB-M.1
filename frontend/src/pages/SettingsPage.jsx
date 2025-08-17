import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ApiService from '../services/api';

const SettingsPage = () => {
  const { settings, updateSettings } = useApp();
  const [activeTab, setActiveTab] = useState('addon-manager');
  const [addons, setAddons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAddons = async () => {
      try {
        const addonList = await ApiService.getAddons();
        setAddons(addonList || []);
      } catch (error) {
        console.error('Failed to load addons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAddons();
  }, []);

  const handleSyncContent = async () => {
    try {
      await ApiService.syncAddons();
      // Reload addons after sync
      const addonList = await ApiService.getAddons();
      setAddons(addonList || []);
    } catch (error) {
      console.error('Failed to sync content:', error);
    }
  };

  const handleAddAddon = () => {
    // TODO: Implement add addon functionality
    console.log('Add addon clicked');
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
          + Add Addon
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
                    <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                      {addon.enabled ? 'Disable' : 'Enable'}
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
            { id: 'addon-manager', label: 'Addon Manager', icon: '⚙️' },
            { id: 'player-settings', label: 'Player Settings', icon: '📺' },
            { id: 'catalogs', label: 'Catalogs', icon: '📚' },
            { id: 'api-keys', label: 'API Keys', icon: '🔑' },
            { id: 'external-services', label: 'External Services', icon: '🌐' },
            { id: 'general', label: 'General', icon: '⚙️' }
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
              <span style={{ marginRight: '12px' }}>{tab.icon}</span>
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