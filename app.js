import webhookConsumer from "./consumer/webhook.js";

// Start event consumer, will http call event dispatcher when receive an event
webhookConsumer.init();
