# sqs-consumer-concurrent

Build SQS-based applications without the boilerplate. Just define an async function that handles the SQS message processing. This repository is just an adding of concurrency in the respository [sqs-consumer](https://www.npmjs.com/package/sqs-consumer).

## Installation

To install this package, simply enter the following command into your terminal (or the variant of whatever package manager you are using):

```bash
npm install @praveendhaked/sqs-consumer-concurrent
```

### Node version

We will only support Node versions that are actively or security supported by the Node team.

## Usage

```js
import { Consumer } from '@praveendhaked/sqs-consumer-concurrent';

const app = Consumer.create({
  queueUrl: 'https://sqs.eu-west-1.amazonaws.com/account-id/queue-name',
  handleMessage: async (message) => {
    // do some work with `message`
  }
});

app.on('error', (err) => {
  console.error(err.message);
});

app.on('processing_error', (err) => {
  console.error(err.message);
});

app.start();
```

- The queue is polled continuously for messages using [long polling](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-long-polling.html).
- Messages are deleted from the queue once the handler function has completed successfully.
- Throwing an error (or returning a rejected promise) from the handler function will cause the message to be left on the queue. An [SQS redrive policy](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html) can be used to move messages that cannot be processed to a dead letter queue.
- By default messages are processed one at a time – a new message won't be received until the first one has been processed. To process messages in parallel, use the `batchSize` option [detailed below](#options).
- By default, messages that are sent to the `handleMessage` and `handleMessageBatch` functions will be considered as processed if they return without an error. To acknowledge individual messages, please return the message that you want to acknowledge if you are using `handleMessage` or the messages for `handleMessageBatch`. It's also important to await any processing that you are doing to ensure that messages are processed one at a time.

### Credentials

By default the consumer will look for AWS credentials in the places [specified by the AWS SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Setting_AWS_Credentials). The simplest option is to export your credentials as environment variables:

```bash
export AWS_SECRET_ACCESS_KEY=...
export AWS_ACCESS_KEY_ID=...
```

If you need to specify your credentials manually, you can use a pre-configured instance of the [SQS Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/classes/sqsclient.html) client.

```js
import { Consumer } from '@praveendhaked/sqs-consumer-concurrent';
import { SQSClient } from '@aws-sdk/client-sqs';

const app = Consumer.create({
  queueUrl: 'https://sqs.eu-west-1.amazonaws.com/account-id/queue-name',
  handleMessage: async (message) => {
    // ...
  },
  sqs: new SQSClient({
    region: 'my-region',
    credentials: {
      accessKeyId: 'yourAccessKey',
      secretAccessKey: 'yourSecret'
    }
  })
});

app.on('error', (err) => {
  console.error(err.message);
});

app.on('processing_error', (err) => {
  console.error(err.message);
});

app.on('timeout_error', (err) => {
  console.error(err.message);
});

app.start();
```

### AWS IAM Permissions

Consumer will receive and delete messages from the SQS queue. Ensure `sqs:ReceiveMessage`, `sqs:DeleteMessage`, `sqs:DeleteMessageBatch`, `sqs:ChangeMessageVisibility` and `sqs:ChangeMessageVisibilityBatch` access is granted on the queue being consumed.

## API

### `Consumer.create(options)`

Creates a new SQS consumer using the [defined options](https://bbc.github.io/sqs-consumer/interfaces/ConsumerOptions.html).

### `consumer.start()`

Start polling the queue for messages.

### `consumer.stop(options)`

Stop polling the queue for messages. [You can find the options definition here](https://bbc.github.io/sqs-consumer/interfaces/StopOptions.html).

By default, the value of `abort` is set to `false` which means pre existing requests to AWS SQS will still be made until they have concluded. If you would like to abort these requests instead, pass the abort value as `true`, like so:

`consumer.stop({ abort: true })`

### `consumer.isRunning`

Returns the current polling state of the consumer: `true` if it is actively polling, `false` if it is not.

### `consumer.updateOption(option, value)`

Updates the provided option with the provided value.

You can [find out more about this here](https://bbc.github.io/sqs-consumer/classes/Consumer.html#updateOption).

### Events

Each consumer is an [`EventEmitter`](https://nodejs.org/api/events.html) and [emits these events](https://bbc.github.io/sqs-consumer/interfaces/Events.html).

## Contributing

We welcome and appreciate contributions for anyone who would like to take the time to fix a bug or implement a new feature.

But before you get started, [please read the contributing guidelines](https://github.com/bbc/sqs-consumer/blob/main/.github/CONTRIBUTING.md) and [code of conduct](https://github.com/bbc/sqs-consumer/blob/main/.github/CODE_OF_CONDUCT.md).

## License

SQS Consumer is distributed under the Apache License, Version 2.0, see [LICENSE](https://github.com/bbc/sqs-consumer/blob/main/LICENSE) for more information.
