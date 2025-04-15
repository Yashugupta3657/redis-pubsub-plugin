# redis-pubsub-plugin

A lightweight Node.js wrapper around Redis Pub/Sub using EventEmitter for easy integration in multi-instance or microservice architectures.

## ✨ Features

- Simple API for publishing and subscribing
- Built-in support for multiple channels
- Works in multi-instance setups (horizontal scaling)
- Uses native Redis Pub/Sub with Node.js

---

## 📦 Installation

```bash
npm install redis-pubsub-plugin

const RedisPubSub = require('redis-pubsub-plugin');

// Set your Redis credentials
const pubsub = new RedisPubSub({
  host: '13.126.104.111',
  port: 6379,
  password: 'redispass',
  channels: ['test-channel'] // Define channels to subscribe to
});

// Subscribe to a channel
pubsub.on('test-channel', (message) => {
  console.log('Received message:', message);
});

// Publish a message to the channel
setTimeout(() => {
    pubsub.publish('test-channel', 'Hello from Redis PubSub!');
}, 2000);
