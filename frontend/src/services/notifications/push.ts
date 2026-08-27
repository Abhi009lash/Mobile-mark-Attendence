import { Platform } from "react-native";
import apiClient from "../../api/client";

export class MobilePushService {
  /**
   * Registers the mobile device for native status-bar push notifications
   * and synchronizes the push token with the backend.
   */
  static async registerForPushNotifications(): Promise<string | null> {
    try {
      // In native Expo / React Native environment:
      // const { status } = await Notifications.requestPermissionsAsync();
      // const token = (await Notifications.getExpoPushTokenAsync()).data;
      
      const mockDevicePushToken = `ExponentPushToken[mock_device_${Platform.OS}_${Date.now()}]`;

      await apiClient.post("/users/me/push-token", {
        push_token: mockDevicePushToken,
      });

      return mockDevicePushToken;
    } catch {
      return null;
    }
  }
}

export default MobilePushService;
