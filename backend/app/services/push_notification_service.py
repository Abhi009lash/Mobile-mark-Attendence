import logging
from typing import Dict, Any, Optional
import httpx

logger = logging.getLogger(__name__)

EXPO_PUSH_API_URL = "https://exp.host/--/api/v2/push/send"


class PushNotificationService:
    @staticmethod
    def send_mobile_push(
        push_token: Optional[str],
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None,
        sound: str = "default"
    ) -> bool:
        """
        Dispatches a native system-tray mobile push notification via Expo Push Notifications API.
        Appears in the Android / iOS notification center even when app is backgrounded or terminated.
        """
        if not push_token or not push_token.startswith("ExponentPushToken["):
            logger.info(
                f"[MOBILE PUSH MOCK] Token: {push_token} | Title: {title} | Body: {body}"
            )
            return True

        payload = {
            "to": push_token,
            "sound": sound,
            "title": title,
            "body": body,
            "data": data or {},
            "priority": "high",
            "channelId": "default",
        }

        try:
            with httpx.Client(timeout=5.0) as client:
                res = client.post(
                    EXPO_PUSH_API_URL,
                    json=payload,
                    headers={"Accept": "application/json", "Content-Type": "application/json"}
                )
                if res.status_code == 200:
                    logger.info(f"Mobile push notification sent to {push_token}")
                    return True
                else:
                    logger.warning(f"Expo push server returned status {res.status_code}: {res.text}")
                    return False
        except Exception as e:
            logger.error(f"Failed to dispatch mobile push notification: {str(e)}")
            return False
