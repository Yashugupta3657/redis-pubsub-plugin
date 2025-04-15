const redis = require('ioredis');
const EventEmitter = require('events');

const createRedisClient = (host, port, password) => {
  const options = {
    host,
    port,
  };
  if (password) {
    options.password = password;
  }

  // Return the client directly
  const subscribered = redis.createClient(options);
  return subscribered;
};

class RedisPubSub extends EventEmitter {
  constructor(config = {}) {
    super();
    this.redisHost = config.host || '127.0.0.1';
    this.redisPort = config.port || 6379;
    this.redisPassword = config.password || null;
    this.channels = config.channels || [];
    this.publisherReady = false;

    // Create Redis clients outside the class logic
    this.subscriber = createRedisClient(this.redisHost, this.redisPort, this.redisPassword);
    this.publisher = createRedisClient(this.redisHost, this.redisPort, this.redisPassword);

    this.subscriber.on('connect', () => console.log('Redis subscriber connected'));
    this.publisher.on('connect', () => {
      console.log('Redis publisher connected');
      this.publisherReady = true;
    });

    this.subscriber.on('error', (err) => console.error('Redis subscriber error:', err));
    this.publisher.on('error', (err) => console.error('Redis publisher error:', err));

    this._subscribeToChannels(this.channels);
  }

  _subscribeToChannels(channels) {
    channels.forEach(channel => this.subscribe(channel));
  }

  subscribe(channel) {
    this.subscriber.subscribe(channel, (err, count) => {
      if (err) {
        console.error(`Failed to subscribe to ${channel}`, err);
      } else {
        console.log(`Subscribed to ${channel}`);
      }
    });

    this.subscriber.on('message', (chan, message) => {
      if (chan === channel) {
        this.emit(channel, message);
      }
    });
  }

  publish(channel, message) {
    if (!this.publisherReady) {
      console.warn(`Redis publisher not ready. Message to "${channel}" not sent.`);
      return;
    }
    this.publisher.publish(channel, message);
  }

  shutdown() {
    this.subscriber.quit();
    this.publisher.quit();
  }
}

module.exports = RedisPubSub;