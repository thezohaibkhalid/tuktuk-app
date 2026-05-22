import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Shows banner/sound when notifications arrive while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export type PushRegistration = {
  expoPushToken: string;
  status: 'granted';
};

export type PushFailure = {
  expoPushToken: null;
  status: 'denied' | 'simulator' | 'no-project-id' | 'error';
  reason?: string;
};

export type PushResult = PushRegistration | PushFailure;

/**
 * Request notification permission and fetch the Expo push token for this
 * device. Safe to call multiple times — it short-circuits if permission is
 * already granted.
 *
 * The returned `expoPushToken` is what you send to the backend (e.g. POST
 * /v1/customer/push-tokens). The backend then talks to Expo's push service.
 */
export async function registerForPushAsync(): Promise<PushResult> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200, 200, 200],
      lightColor: '#f4ce55',
    });
  }

  if (!Device.isDevice) {
    return {
      expoPushToken: null,
      status: 'simulator',
      reason: 'Push tokens only work on physical devices.',
    };
  }

  const existing = await Notifications.getPermissionsAsync();
  let finalStatus = existing.status;
  if (finalStatus !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    finalStatus = req.status;
  }
  if (finalStatus !== 'granted') {
    return { expoPushToken: null, status: 'denied' };
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants.easConfig as { projectId?: string } | undefined)?.projectId;

  if (!projectId) {
    return {
      expoPushToken: null,
      status: 'no-project-id',
      reason:
        'Set extra.eas.projectId in app.json (run `eas init` if you haven’t).',
    };
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return { expoPushToken: token.data, status: 'granted' };
  } catch (e) {
    return {
      expoPushToken: null,
      status: 'error',
      reason: e instanceof Error ? e.message : 'Unknown push error',
    };
  }
}
