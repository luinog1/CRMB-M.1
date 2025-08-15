import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ApiService from '../services/api';

const SettingsPage = () => {
  const { settings, updateSettings, settingsTab, setSettingsTab } = useApp();
  const [authStatus, setAuthStatus] = useState({
    trakt: false,
    mdblist: false
  });
  const [externalPlayers, setExternalPlayers] = useState([
    { id: 'infuse', name: 'Infuse', enabled: settings.enabledPlayers?.includes('infuse') || false },
    { id: 'vlc', name: 'VLC', enabled: settings.enabledPlayers?.includes('vlc') || false },
    { id: 'outplayer', name: 'Outplayer', enabled: settings.enabledPlayers?.includes('outplayer') || false }
  ]);
  const [installedAddons, setInstalledAddons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addonUrl, setAddonUrl] = useState('');

  const settingsTabs = ['Player', 'Addons', 'Catalogs', 'APIs', 'External'];

  useEffect(() => {
    // Check if Trakt is authenticated
    if (settings.traktAccessToken) {
      setAuthStatus(prev => ({ ...prev, trakt: true }));
    }

    // Check if MDbList is authenticated
    if (settings.mdblistApiKey) {
      setAuthStatus(prev => ({ ...prev, mdblist: true }));
    }

    // Load installed add-ons
    loadInstalledAddons();
  }, [settings]);

  const loadInstalledAddons = async () => {
    try {
      // In a real implementation, this would load from localStorage or backend
      // For now, we'll use mock data if nothing is stored
      const storedAddons = localStorage.getItem('installedAddons');
      if (storedAddons) {
        setInstalledAddons(JSON.parse(storedAddons));
      } else {
        // Default add-ons
        const defaultAddons = [
          {
            id: 'torrentio',
            name: 'Torrentio',
            description: 'Torrent streams provider',
            url: 'https://torrentio.strem.io/manifest.json'
          },
          {
            id: 'tmdb-catalog',
            name: 'TMDB Catalog',
            description: 'Movies and TV Shows metadata',
            url: 'https://v3-cinemeta.strem.io/manifest.json'
          }
        ];
        setInstalledAddons(defaultAddons);
        localStorage.setItem('installedAddons', JSON.stringify(defaultAddons));
      }
    } catch (error) {
      console.error('Failed to load installed add-ons:', error);
    }
  };

  const handleToggle = (key) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleSelectChange = (key, value) => {
    updateSettings({ [key]: value });
    
    // Update API keys in ApiService when changed
    if (key === 'tmdbApiKey') {
      ApiService.setApiKey('tmdb', value);
    } else if (key === 'traktClientId') {
      ApiService.setApiKey('trakt_client_id', value);
    } else if (key === 'mdblistApiKey') {
      ApiService.setApiKey('mdblist', value);
    }
  };

  const toggleExternalPlayer = (playerId) => {
    const updatedPlayers = externalPlayers.map(player => {
      if (player.id === playerId) {
        return { ...player, enabled: !player.enabled };
      }
      return player;
    });
    
    setExternalPlayers(updatedPlayers);
    
    // Update the enabled players setting
    const enabledPlayerIds = updatedPlayers
      .filter(player => player.enabled)
      .map(player => player.id);
    
    updateSettings({ enabledPlayers: enabledPlayerIds });
  };

  const handleTraktAuth = async () => {
    try {
      setIsLoading(true);
      if (!settings.traktClientId) {
        alert('Please enter your Trakt Client ID first');
        setIsLoading(false);
        return;
      }

      if (authStatus.trakt) {
        // Logout
        updateSettings({ traktAccessToken: '' });
        setAuthStatus(prev => ({ ...prev, trakt: false }));
        alert('Successfully logged out of Trakt');
      } else {
        // Login
        const apiService = new ApiService();
        const response = await apiService.getTraktAuthUrl(settings.traktClientId);
        
        if (response.authUrl) {
          // Open the auth URL in a new window
          window.open(response.authUrl, '_blank');
          
          // In a real implementation, we would handle the callback
          // For now, we'll simulate a successful auth after a delay
          setTimeout(() => {
            const mockToken = 'mock_trakt_access_token_' + Date.now();
            updateSettings({ traktAccessToken: mockToken });
            setAuthStatus(prev => ({ ...prev, trakt: true }));
            alert('Successfully authenticated with Trakt');
            setIsLoading(false);
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Trakt authentication error:', error);
      alert('Failed to authenticate with Trakt');
      setIsLoading(false);
    }
  };

  const handleMdblistAuth = () => {
    if (authStatus.mdblist) {
      // Logout
      updateSettings({ mdblistApiKey: '' });
      setAuthStatus(prev => ({ ...prev, mdblist: false }));
    }
  };

  const installAddon = async () => {
    if (!addonUrl) {
      alert('Please enter an add-on URL');
      return;
    }

    try {
      setIsLoading(true);
      
      // In a real implementation, this would call the backend
      // For now, we'll simulate a successful installation
      setTimeout(() => {
        const newAddon = {
          id: 'addon-' + Date.now(),
          name: 'Custom Add-on',
          description: 'User installed add-on',
          url: addonUrl
        };
        
        const updatedAddons = [...installedAddons, newAddon];
        setInstalledAddons(updatedAddons);
        localStorage.setItem('installedAddons', JSON.stringify(updatedAddons));
        
        setAddonUrl('');
        setIsLoading(false);
        alert('Add-on installed successfully');
      }, 1500);
    } catch (error) {
      console.error('Failed to install add-on:', error);
      alert('Failed to install add-on');
      setIsLoading(false);
    }
  };

  const handleConfigureAddon = (addonName) => {
    console.log('Configuring addon:', addonName);
    // TODO: Implement addon configuration modal or navigation
  };

  const handleRemoveAddon = (addonId) => {
    console.log('Removing addon:', addonId);
    const updatedAddons = installedAddons.filter(addon => addon.id !== addonId);
    setInstalledAddons(updatedAddons);
    localStorage.setItem('installedAddons', JSON.stringify(updatedAddons));
  };

  const renderPlayerSettings = () => {
    return (
      <div className="settings-section">
        <h3>Player Settings</h3>
        
        <div className="setting-item">
          <div className="setting-label">
            <span>Default Quality</span>
            <span className="setting-description">Select your preferred streaming quality</span>
          </div>
          <div className="setting-control">
            <select 
              value={settings.defaultQuality || '1080p'}
              onChange={(e) => handleSelectChange('defaultQuality', e.target.value)}
            >
              <option value="4K">4K</option>
              <option value="1080p">1080p</option>
              <option value="720p">720p</option>
              <option value="480p">480p</option>
              <option value="360p">360p</option>
            </select>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <span>Autoplay Next Episode</span>
            <span className="setting-description">Automatically play the next episode in a series</span>
          </div>
          <div className="setting-control">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.autoplayNext || false}
                onChange={() => handleToggle('autoplayNext')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <span>Skip Intro</span>
            <span className="setting-description">Automatically skip intro sequences when detected</span>
          </div>
          <div className="setting-control">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.skipIntro || false}
                onChange={() => handleToggle('skipIntro')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <span>Hardware Acceleration</span>
            <span className="setting-description">Use hardware acceleration for video playback when available</span>
          </div>
          <div className="setting-control">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.hardwareAcceleration || false}
                onChange={() => handleToggle('hardwareAcceleration')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <span>Default Volume</span>
            <span className="setting-description">Set your preferred default volume level</span>
          </div>
          <div className="setting-control">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={settings.volume || 70}
              onChange={(e) => handleSelectChange('volume', parseInt(e.target.value))}
            />
            <span>{settings.volume || 70}%</span>
          </div>
        </div>

        <h3>External Players</h3>
        <div className="setting-description" style={{ marginBottom: '15px' }}>
          Enable external players for streaming content outside the app
        </div>
        
        {externalPlayers.map(player => (
          <div className="setting-item" key={player.id}>
            <div className="setting-label">
              <span>{player.name}</span>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={player.enabled}
                  onChange={() => toggleExternalPlayer(player.id)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAddonsSettings = () => (
    <div className="settings-section">
      <h3>Add-ons</h3>
      
      <div className="addon-actions">
        <div className="addon-install-form">
          <input 
            type="text" 
            placeholder="Enter add-on URL"
            value={addonUrl}
            onChange={(e) => setAddonUrl(e.target.value)}
          />
          <button 
            className="btn btn-primary" 
            onClick={installAddon}
            disabled={isLoading}
          >
            {isLoading ? 'Installing...' : 'Install Add-on'}
          </button>
        </div>
        <button className="btn btn-secondary">Browse Community Add-ons</button>
      </div>

      <div className="addon-list">
        {installedAddons.map(addon => (
          <div className="addon-item" key={addon.id}>
            <div className="addon-info">
              <h4>{addon.name}</h4>
              <p>{addon.description}</p>
              <span className="addon-version">{addon.url}</span>
            </div>
            <div className="addon-controls">
              <button 
                className="btn btn-small" 
                onClick={() => handleConfigureAddon(addon.id)}
              >
                Configure
              </button>
              <button 
                className="btn btn-small btn-danger" 
                onClick={() => handleRemoveAddon(addon.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCatalogsSettings = () => (
    <div className="settings-section">
      <h3>Content Catalogs</h3>
      
      <div className="setting-item">
        <label>Show Adult Content</label>
        <div className="toggle-switch">
          <input 
            type="checkbox" 
            checked={settings.showAdultContent} 
            onChange={() => handleToggle('showAdultContent')}
          />
          <span className="slider"></span>
        </div>
      </div>

      <div className="setting-item">
        <label>Preferred Language</label>
        <select 
          value={settings.preferredLanguage} 
          onChange={(e) => handleSelectChange('preferredLanguage', e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>

      <div className="setting-item">
        <label>Content Region</label>
        <select 
          value={settings.contentRegion} 
          onChange={(e) => handleSelectChange('contentRegion', e.target.value)}
        >
          <option value="US">United States</option>
          <option value="UK">United Kingdom</option>
          <option value="CA">Canada</option>
          <option value="AU">Australia</option>
        </select>
      </div>
    </div>
  );

  const renderAPIsSettings = () => (
    <div className="settings-section">
      <h3>API Configuration</h3>
      
      <div className="setting-item">
        <div className="setting-label">
          <span>TMDB API Key</span>
          <span className="setting-description">Your TMDB API key for metadata</span>
        </div>
        <div className="setting-control">
          <input 
            type="password" 
            value={settings.tmdbApiKey || ''} 
            onChange={(e) => handleSelectChange('tmdbApiKey', e.target.value)}
            placeholder="Enter your TMDB API key"
          />
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span>Trakt Integration</span>
          <span className="setting-description">Sync watchlist and viewing progress</span>
        </div>
        <div className="setting-control-group">
          <input 
            type="text" 
            value={settings.traktClientId || ''} 
            onChange={(e) => handleSelectChange('traktClientId', e.target.value)}
            placeholder="Enter your Trakt client ID"
            disabled={authStatus.trakt}
          />
          <button 
            className={authStatus.trakt ? "btn btn-danger" : "btn btn-primary"}
            onClick={handleTraktAuth}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (authStatus.trakt ? 'Disconnect' : 'Connect')}
          </button>
        </div>
        {authStatus.trakt && (
          <div className="auth-status success">
            Connected to Trakt
          </div>
        )}
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span>MDbList API Key</span>
          <span className="setting-description">Your MDbList API key for watchlists and ratings</span>
        </div>
        <div className="setting-control-group">
          <input 
            type="text" 
            placeholder="Enter your MDbList API key"
            value={settings.mdblistApiKey || ''}
            onChange={(e) => handleSelectChange('mdblistApiKey', e.target.value)}
          />
          {authStatus.mdblist && (
            <button 
              className="btn btn-danger"
              onClick={handleMdblistAuth}
            >
              Disconnect
            </button>
          )}
        </div>
        {authStatus.mdblist && (
          <div className="auth-status success">
            Connected to MDbList
          </div>
        )}
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span>API Caching</span>
          <span className="setting-description">Cache API responses for faster loading</span>
        </div>
        <div className="setting-control">
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={settings.enableApiCaching} 
              onChange={() => handleToggle('enableApiCaching')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderExternalSettings = () => (
    <div className="settings-section">
      <h3>External Services</h3>
      
      <div className="setting-item">
        <div className="setting-label">
          <span>External Players</span>
          <span className="setting-description">Configure external video players</span>
        </div>
        <div className="setting-control">
          <div className="external-players-list">
            {Object.keys(externalPlayers).map(player => (
              <div key={player} className="external-player-item">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={externalPlayers[player].enabled} 
                    onChange={() => toggleExternalPlayer(player)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span>{externalPlayers[player].name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span>Sync Services</span>
          <span className="setting-description">Manage content synchronization</span>
        </div>
        <div className="setting-control">
          <div className="sync-services-list">
            <div className="sync-service-item">
              <div className="sync-service-info">
                <span>Trakt.tv</span>
                <span className="sync-status">{authStatus.trakt ? 'Connected' : 'Not connected'}</span>
              </div>
              <button 
                className={authStatus.trakt ? "btn btn-danger btn-small" : "btn btn-primary btn-small"}
                onClick={handleTraktAuth}
              >
                {authStatus.trakt ? 'Disconnect' : 'Connect'}
              </button>
            </div>
            
            <div className="sync-service-item">
              <div className="sync-service-info">
                <span>MDbList</span>
                <span className="sync-status">{authStatus.mdblist ? 'Connected' : 'Not connected'}</span>
              </div>
              <button 
                className={authStatus.mdblist ? "btn btn-danger btn-small" : "btn btn-primary btn-small"}
                onClick={handleMdblistAuth}
              >
                {authStatus.mdblist ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span>Enable Notifications</span>
          <span className="setting-description">Receive alerts for new content and updates</span>
        </div>
        <div className="setting-control">
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={settings.enableNotifications} 
              onChange={() => handleToggle('enableNotifications')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span>Auto-update Add-ons</span>
          <span className="setting-description">Keep add-ons up to date automatically</span>
        </div>
        <div className="setting-control">
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={settings.autoUpdateAddons} 
              onChange={() => handleToggle('autoUpdateAddons')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span>Analytics & Telemetry</span>
          <span className="setting-description">Help improve the app by sharing usage data</span>
        </div>
        <div className="setting-control">
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={settings.enableAnalytics} 
              onChange={() => handleToggle('enableAnalytics')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span>Theme</span>
          <span className="setting-description">Choose your preferred appearance</span>
        </div>
        <div className="setting-control">
          <select 
            value={settings.theme} 
            onChange={(e) => handleSelectChange('theme', e.target.value)}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSettingsContent = () => {
    switch(settingsTab) {
      case 'Player':
        return renderPlayerSettings();
      case 'Addons':
        return renderAddonsSettings();
      case 'Catalogs':
        return renderCatalogsSettings();
      case 'APIs':
        return renderAPIsSettings();
      case 'External':
        return renderExternalSettings();
      default:
        return renderPlayerSettings();
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-nav">
        {settingsTabs.map(tab => (
          <button
            key={tab}
            className={`settings-tab ${settingsTab === tab ? 'active' : ''}`}
            onClick={() => setSettingsTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {renderSettingsContent()}
      </div>
    </div>
  );
};

export default SettingsPage;