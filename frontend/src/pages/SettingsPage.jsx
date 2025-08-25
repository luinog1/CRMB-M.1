import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ApiService from '../services/api';

const SettingsPage = () => {
  const { settings, updateSettings } = useApp();
  const [activeTab, setActiveTab] = useState('addon-manager');
  const [addons, setAddons] = useState([]);
  const [availableAddons, setAvailableAddons] = useState([]);
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
    loadAvailableAddons();
  }, [updateSettings]);

  const loadAvailableAddons = async () => {
    try {
      console.log('🔍 Fetching available addons from API...');
      const response = await ApiService.getAvailableAddons();
      console.log('📋 Available addons response:', response);
      
      if (response && response.length > 0) {
        // Filter out addons that are already installed
        const installedAddonIds = addons.map(addon => addon.id);
        const filteredAvailableAddons = response.filter(
          addon => !installedAddonIds.includes(addon.id)
        );
        setAvailableAddons(filteredAvailableAddons);
        console.log(`✅ Found ${filteredAvailableAddons.length} available addons`);
      } else {
        setAvailableAddons([]);
        console.log('⚠️ No available addons found');
      }
    } catch (error) {
      console.error('❌ Failed to fetch available addons:', error);
      setAvailableAddons([]);
    }
  };

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

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddonUrl, setNewAddonUrl] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState('');

  const handleAddAddon = () => {
    console.log('➕ Opening add addon modal');
    setShowAddModal(true);
    setNewAddonUrl('');
    setError(null);
  };

  const handleInstallAddonFromForm = async () => {
    if (!newAddonUrl.trim()) {
      setError('Addon URL is required');
      return;
    }

    try {
      setIsInstalling(true);
      setError(null);
      setInstallProgress('Validating addon URL...');

      // Validate URL format
      let formattedUrl = newAddonUrl.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        setInstallProgress('Adding https:// prefix...');
        formattedUrl = `https://${formattedUrl}`;
      }

      setInstallProgress('Testing addon manifest...');
      console.log(`🔍 Installing addon from: ${formattedUrl}`);

      // Test manifest first using the backend proxy
      const manifestResponse = await fetch(`/api/stremio/manifest?url=${encodeURIComponent(formattedUrl)}`);
      if (!manifestResponse.ok) {
        throw new Error(`Failed to fetch manifest: ${manifestResponse.status}`);
      }

      const validationResult = await manifestResponse.json();
      if (!validationResult.success || !validationResult.validation.valid) {
        const errors = validationResult.validation?.errors || ['Invalid addon manifest'];
        throw new Error(`Invalid addon: ${errors.join(', ')}`);
      }

      const manifest = validationResult.validation.manifest;

      setInstallProgress('Installing addon...');
      const response = await ApiService.installAddon(formattedUrl);

      if (response && response.success !== false) {
        console.log('✅ Addon installed successfully');
        setAddons(prevAddons => [...prevAddons, {
          ...manifest,
          id: response.addon?.id || manifest.id || `addon-${Date.now()}`,
          url: formattedUrl,
          enabled: true,
          contentCount: 0,
          status: 'active'
        }]);

        // Save to localStorage
        const updatedAddons = [...addons, {
          ...manifest,
          id: response.addon?.id || manifest.id || `addon-${Date.now()}`,
          url: formattedUrl,
          enabled: true,
          contentCount: 0,
          status: 'active'
        }];
        localStorage.setItem('stremio_addons', JSON.stringify(updatedAddons));

        // Update context if available
        if (updateSettings) {
          updateSettings({ addons: updatedAddons });
        }

        setShowAddModal(false);
        setError(null);
        setInstallProgress('');
      } else {
        throw new Error(response?.error || 'Failed to install addon');
      }
    } catch (error) {
      console.error('❌ Failed to install addon:', error);
      setError(error.message || 'Failed to install addon. Please check the URL and try again.');
    } finally {
      setIsInstalling(false);
      setInstallProgress('');
    }
  };

  const handleAddAvailableAddon = async (addon) => {
    console.log(`➕ Adding available addon: ${addon.name} (${addon.id})`);
    try {
      setIsLoading(true);
      const newAddon = await ApiService.installAddon(addon.url);
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
        
        // Refresh available addons to remove the one that was just added
        await loadAvailableAddons();
        
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
    console.log('Current addons:', addons);
    console.log('isLoading:', isLoading);

    if (isLoading) {
      console.log('⚠️ Cannot toggle addon while loading');
      console.groupEnd();
      return;
    }

    // Update state
    const updatedAddons = addons.map(addon => {
      if (addon.id === addonId) {
        console.log(`${addon.enabled ? '🔴 Disabling' : '🟢 Enabling'} addon: ${addon.name}`);
        return { ...addon, enabled: !addon.enabled };
      }
      return addon;
    });

    console.log('Updated addons:', updatedAddons);
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
        <button className="btn btn-primary" onClick={handleAddAddon} disabled={isLoading}>
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
                      onClick={() => {
                        console.log('🔘 Toggle button clicked for addon:', addon.id);
                        handleToggleAddon(addon.id);
                      }}
                      disabled={isLoading}
                      title={isLoading ? 'Please wait for current operation to complete' : `Click to ${addon.enabled ? 'disable' : 'enable'} this addon`}
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
            <p className="empty-state-description" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Use the "Add New Addon" button above to get started
            </p>
          </div>
        )}
      </div>

    </div>
  );

  // Add Addon Modal Component
  const AddonModal = () => {
    if (!showAddModal) return null;

    return React.createElement('div', {
      className: 'modal-overlay'
    }, React.createElement('div', {
      className: 'modal-content'
    }, [
      // Modal Header
      React.createElement('div', {
        key: 'modal-header',
        className: 'modal-header'
      }, [
        React.createElement('h3', { key: 'title' }, 'Add New Addon'),
        React.createElement('button', {
          key: 'close',
          onClick: () => {
            setShowAddModal(false);
            setError(null);
            setInstallProgress('');
          },
          className: 'modal-close'
        }, React.createElement('svg', {
          width: '20',
          height: '20',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: '2'
        }, [
          React.createElement('line', { key: 'line1', x1: '18', y1: '6', x2: '6', y2: '18' }),
          React.createElement('line', { key: 'line2', x1: '6', y1: '6', x2: '18', y2: '18' })
        ]))
      ]),

      // Modal Body
      React.createElement('div', {
        key: 'modal-body',
        className: 'modal-body'
      }, [
        // Error Display
        error && React.createElement('div', {
          key: 'error',
          className: 'error-message',
          style: {
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--error-color)',
            borderRadius: '8px',
            color: 'var(--error-color)',
            marginBottom: '20px'
          }
        }, [
          React.createElement('div', {
            key: 'error-content',
            style: { display: 'flex', alignItems: 'center', gap: '8px' }
          }, [
            React.createElement('svg', {
              key: 'icon',
              width: '20',
              height: '20',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: '2'
            }, [
              React.createElement('circle', { key: 'circle', cx: '12', cy: '12', r: '10' }),
              React.createElement('line', { key: 'line1', x1: '12', y1: '8', x2: '12', y2: '12' }),
              React.createElement('line', { key: 'line2', x1: '12', y1: '16', x2: '12.01', y2: '16' })
            ]),
            error
          ])
        ]),

        // Progress Display
        installProgress && React.createElement('div', {
          key: 'progress',
          className: 'progress-message',
          style: {
            padding: '12px 16px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid var(--primary-color)',
            borderRadius: '8px',
            color: 'var(--primary-color)',
            marginBottom: '20px'
          }
        }, [
          React.createElement('div', {
            key: 'progress-content',
            style: { display: 'flex', alignItems: 'center', gap: '8px' }
          }, [
            React.createElement('div', {
              key: 'spinner',
              style: {
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid currentColor',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }
            }),
            installProgress
          ])
        ]),

        // Form Field - URL only
        React.createElement('div', { key: 'form-group-url', className: 'form-group' }, [
          React.createElement('label', { key: 'label' }, 'Addon URL *'),
          React.createElement('input', {
            key: 'input',
            type: 'url',
            value: newAddonUrl,
            onChange: (e) => setNewAddonUrl(e.target.value),
            placeholder: 'https://v3-cinemeta.strem.io',
            disabled: isInstalling
          }),
          React.createElement('div', {
            key: 'help-text',
            style: {
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginTop: '4px'
            }
          }, 'Enter the URL to the addon manifest (e.g., https://v3-cinemeta.strem.io)')
        ])
      ]),

      // Modal Footer
      React.createElement('div', {
        key: 'modal-footer',
        className: 'modal-footer'
      }, [
        React.createElement('button', {
          key: 'cancel',
          onClick: () => {
            setShowAddModal(false);
            setError(null);
            setInstallProgress('');
          },
          className: 'btn btn-secondary',
          disabled: isInstalling
        }, 'Cancel'),
        React.createElement('button', {
          key: 'add',
          onClick: handleInstallAddonFromForm,
          className: 'btn btn-primary',
          disabled: isInstalling || !newAddonUrl.trim()
        }, isInstalling ? 'Installing...' : 'Add Addon')
      ])
    ]));
  };

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
        <h1 className="page-title">External Playback</h1>
        <p className="page-description">Configure external media players for content playback</p>
      </div>
      <div className="addon-section">
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
          Available Players
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => console.log('Opening with Infuse')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Infuse</span>
            </div>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={() => console.log('Opening with VLC')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>VLC</span>
            </div>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={() => console.log('Opening with Vidhub')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Vidhub</span>
            </div>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Additional player configuration options will be available here
        </div>
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
            { id: 'external-services', label: 'External Playback', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9M3 12a9 9 0 019-9m-9 9a9 9 0 009 9m-9-9h18"></path></svg> },
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

        {/* Addon Modal */}
        <AddonModal />
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--card-background);
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: var(--secondary-background);
        }

        .modal-body {
          padding: 20px;
        }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          background: var(--secondary-background);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .form-group input:disabled,
        .form-group select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;