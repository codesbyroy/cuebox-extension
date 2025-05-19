/**
* Notification Utility
* 
* Provides functions for showing notifications to the user.
*/

/**
* Show a notification to the user
*/
export const showNotification = (title: string, message: string): void => {
    chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icon/icon128.png'),
    title,
    message
    });
};