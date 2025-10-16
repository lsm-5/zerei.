import { useState, useEffect } from 'react';

const getLocalStorage = (key: string, defaultValue: any) => {
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      return JSON.parse(storedValue);
    }
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  } catch (error) {
    console.error(`Error with localStorage for key "${key}":`, error);
    return defaultValue;
  }
};

const setLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage for key "${key}":`, error);
  }
};

const defaultSettings = {
  notifications: {
    collectionInvites: true,
    friendRequests: true,
    friendActivity: false,
    storeUpdates: true,
  },
  profile: {
    avatarSeed: '',
    useInitialAvatar: false,
  },
};

export const useSettingsStore = () => {
  const [settings, setSettings] = useState(() => getLocalStorage('settings_v1', defaultSettings));

  useEffect(() => {
    setLocalStorage('settings_v1', settings);
  }, [settings]);

  const setNotificationSetting = (key: 'collectionInvites' | 'friendRequests' | 'friendActivity' | 'storeUpdates', value: boolean) => {
    setSettings((prev: any) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const setAvatarSeed = (seed: string) => {
    setSettings((prev: any) => ({
      ...prev,
      profile: {
        ...prev.profile,
        avatarSeed: seed,
      },
    }));
  };

  const setUseInitialAvatar = (useInitial: boolean) => {
    setSettings((prev: any) => ({
      ...prev,
      profile: {
        ...prev.profile,
        useInitialAvatar: useInitial,
      },
    }));
  };

  return {
    settings,
    setNotificationSetting,
    setAvatarSeed,
    setUseInitialAvatar,
  };
};