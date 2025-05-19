/**
 * Storage Context
 * 
 * Provides context for managing storage type (local vs sync)
 * and functions for interacting with the selected storage.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

type StorageType = 'local' | 'sync';

interface StorageContextType {
    storageType: StorageType;
    setStorageType: (type: StorageType) => void;
    isCloudConnected: boolean;
    toggleCloudConnection: () => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storageType, setStorageType] = useState<StorageType>('local');
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // Initialize storage type from saved preference
  useEffect(() => {
    // First check local storage
    chrome.storage.local.get('storagePreference', (localResult) => {
      if (localResult.storagePreference) {
        setStorageType(localResult.storagePreference);
        setIsCloudConnected(localResult.storagePreference === 'sync');
      } else {
        // If not in local, check sync storage
        chrome.storage.sync.get('storagePreference', (syncResult) => {
          const preference = syncResult.storagePreference || 'local';
          setStorageType(preference);
          setIsCloudConnected(preference === 'sync');
        });
      }
    });
  }, []);

    // Toggle between local and sync storage
    const toggleCloudConnection = () => {
        const newStorageType = storageType === 'local' ? 'sync' : 'local';
        const newCloudStatus = !isCloudConnected;
        
        // Save the storage preference
        chrome.storage.local.set({ storagePreference: newStorageType });
        
        // Transfer data between storage types if needed
        transferData(storageType, newStorageType).then(() => {
            setStorageType(newStorageType);
            setIsCloudConnected(newCloudStatus);
            console.log(`Storage switched to ${newStorageType}`);
        });
    };

  // Transfer data between storage types
    const transferData = async (from: StorageType, to: StorageType) => {
        try {
            // Get data from current storage
            const data = await new Promise<any>((resolve) => {
                chrome.storage[from].get(null, (result) => {
                    resolve(result);
                });
            });
        
            // If there's data to transfer
            if (Object.keys(data).length > 0) {
                // Save to new storage
                await new Promise<void>((resolve, reject) => {
                data.storagePreference = to; // Set the new storage type
                chrome.storage[to].set(data, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });

                chrome.storage[from].clear(() => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
        }

        return true;
        } catch (error) {
            console.error('Error transferring data between storage types:', error);
            return false;
        }
    };

    return (
        <StorageContext.Provider value={{ 
            storageType, 
            setStorageType, 
            isCloudConnected, 
            toggleCloudConnection 
        }}>
            {children}
        </StorageContext.Provider>
    );
};

export const useStorage = () => {
    const context = useContext(StorageContext);
    if (context === undefined) {
        throw new Error('useStorage must be used within a StorageProvider');
    }
    return context;
};