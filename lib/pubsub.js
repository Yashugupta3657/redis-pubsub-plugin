const redis = require('redis');
const EventEmitter = require('events');

class RedisPubSub extends EventEmitter {
  constructor(config = {}) {
    super();
    this.redisHost = config.host || 'localhost';
    this.redisPort = config.port || 6379;
    this.redisPassword = config.password || null;
    this.channels = config.channels || [];

    this.subscriber = redis.createClient({
      host: this.redisHost,
      port: this.redisPort,
      password: this.redisPassword,
    });

    this.publisher = redis.createClient({
      host: this.redisHost,
      port: this.redisPort,
      password: this.redisPassword,
    });

    this.subscriber.on('connect', () => console.log('Redis subscriber connected'));
    this.publisher.on('connect', () => console.log('Redis publisher connected'));

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
    this.publisher.publish(channel, message);
  }

  shutdown() {
    this.subscriber.quit();
    this.publisher.quit();
  }
}

module.exports = RedisPubSub;
