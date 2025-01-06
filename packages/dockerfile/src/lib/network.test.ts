import assert from 'node:assert/strict';
import { test } from 'node:test';
import { network, withinNetwork } from './network';

test('network operations', async (t) => {
  const testNetworkName = `test-network-${Date.now()}`;

  await t.test('should create and remove network', async () => {
    const net = network(testNetworkName);
    await net.create();

    const exists = await net.exists();
    assert.equal(exists, true, 'Network should exist after creation');

    await net.remove();
    const existsAfterRemoval = await net.exists();
    assert.equal(
      existsAfterRemoval,
      false,
      'Network should not exist after removal',
    );
  });

  await t.test('should handle withinNetwork lifecycle', async () => {
    let networkExists = false;
    await withinNetwork(async (net) => {
      networkExists = await net.exists();
    });
    assert.equal(
      networkExists,
      true,
      'Network should exist within the callback',
    );
  });
});
