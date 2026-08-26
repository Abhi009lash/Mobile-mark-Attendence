import logging
import time
from typing import Optional, Dict, Any
import redis

from app.core.config import settings

logger = logging.getLogger(__name__)

# In-memory fallback dictionary for development/testing when Redis is not running
_in_memory_blacklist: Dict[str, float] = {}
_in_memory_cache: Dict[str, Any] = {}
_in_memory_rate_limit: Dict[str, list] = {}


class RedisService:
    def __init__(self):
        self._client: Optional[redis.Redis] = None
        self._connected: bool = False
        self._init_connection()

    def _init_connection(self):
        try:
            self._client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=2
            )
            self._client.ping()
            self._connected = True
            logger.info("Connected to Redis successfully.")
        except Exception as e:
            self._connected = False
            logger.warning(f"Redis not available ({e}). Using in-memory fallback.")

    @property
    def is_connected(self) -> bool:
        if not self._connected or not self._client:
            return False
        try:
            self._client.ping()
            return True
        except Exception:
            self._connected = False
            return False

    def blacklist_token(self, jti: str, exp_seconds: int = 900) -> bool:
        """Add a token JTI to the blacklist with an expiry in seconds."""
        if self.is_connected and self._client:
            try:
                self._client.setex(f"bl_{jti}", exp_seconds, "revoked")
                return True
            except Exception as e:
                logger.error(f"Redis blacklist error: {e}")
        # In-memory fallback
        _in_memory_blacklist[jti] = time.time() + exp_seconds
        return True

    def is_token_blacklisted(self, jti: str) -> bool:
        """Check if a token JTI is in the blacklist."""
        if self.is_connected and self._client:
            try:
                return self._client.exists(f"bl_{jti}") > 0
            except Exception as e:
                logger.error(f"Redis is_blacklisted error: {e}")
        # In-memory fallback
        expire_at = _in_memory_blacklist.get(jti)
        if expire_at is not None:
            if time.time() < expire_at:
                return True
            else:
                del _in_memory_blacklist[jti]
        return False

    def rate_limit(self, key: str, max_requests: int = 60, window_seconds: int = 60) -> bool:
        """
        Sliding-window or bucket rate limiter.
        Returns True if request is allowed, False if rate limit exceeded.
        """
        if self.is_connected and self._client:
            try:
                current = int(time.time())
                pipe = self._client.pipeline()
                r_key = f"rl_{key}"
                pipe.zremrangebyscore(r_key, 0, current - window_seconds)
                pipe.zadd(r_key, {str(current) + "_" + str(time.time()): current})
                pipe.zcard(r_key)
                pipe.expire(r_key, window_seconds)
                results = pipe.execute()
                request_count = results[2]
                return request_count <= max_requests
            except Exception as e:
                logger.error(f"Redis rate_limit error: {e}")

        # In-memory fallback
        now = time.time()
        requests = _in_memory_rate_limit.setdefault(key, [])
        # Filter requests in window
        _in_memory_rate_limit[key] = [t for t in requests if t > now - window_seconds]
        if len(_in_memory_rate_limit[key]) < max_requests:
            _in_memory_rate_limit[key].append(now)
            return True
        return False

    def cache_set(self, key: str, value: str, ttl_seconds: int = 300) -> bool:
        """Cache a value with TTL."""
        if self.is_connected and self._client:
            try:
                self._client.setex(f"cache_{key}", ttl_seconds, value)
                return True
            except Exception as e:
                logger.error(f"Redis cache_set error: {e}")
        _in_memory_cache[key] = (value, time.time() + ttl_seconds)
        return True

    def cache_get(self, key: str) -> Optional[str]:
        """Get a cached value."""
        if self.is_connected and self._client:
            try:
                return self._client.get(f"cache_{key}")
            except Exception as e:
                logger.error(f"Redis cache_get error: {e}")
        val_entry = _in_memory_cache.get(key)
        if val_entry:
            val, exp = val_entry
            if time.time() < exp:
                return val
            del _in_memory_cache[key]
        return None


redis_service = RedisService()
