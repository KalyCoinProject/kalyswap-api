import * as assert from 'uvu/assert';
import {describe, get} from './setup/env';


describe('/klc-price', (it) => {
  it('/klc-price', async () => {
    const {statusCode, data, headers} = await get('/kalyswap/klc-price');

    assert.is(statusCode, 200);
    assert.match(data, /^[.?\d]+/);
    assert.is(headers['cache-control'], 'public,s-maxage=300');
  });
});

describe('/', (it) => {
  it('/', async () => {
    const {statusCode, data, headers} = await get('/');

    assert.is(statusCode, 200);
    assert.is(data, 'Refer to https://github.com/kalycoinproject/kalyswap-api for documentation.');
    assert.is(headers['cache-control'], 'public,s-maxage=31536000,immutable');
  });
});

describe('/kswap', (it) => {
  it('/kswap/tvl', async () => {
    const {statusCode, data, headers} = await get('/kswap/tvl');

    assert.is(statusCode, 200);
    assert.match(data, /^[.?\d]+/);
    assert.is(headers['cache-control'], 'public,s-maxage=300');
  });

  it('/kswap/total-volume', async () => {
    const {statusCode, data, headers} = await get('/kswap/total-volume');

    assert.is(statusCode, 200);
    assert.match(data, /^[.?\d]+/);
    assert.is(headers['cache-control'], 'public,s-maxage=300');
  });

  it('/kswap/total-supply', async () => {
    const {statusCode, data, headers} = await get('/kswap/total-supply');

    assert.is(statusCode, 200);
    assert.is(data, '538000000000000000000000000');
    assert.is(headers['cache-control'], 'public,s-maxage=31536000,immutable');
  });

  it('/kswap/total-supply-whole', async () => {
    const {statusCode, data, headers} = await get('/kswap/total-supply-whole');

    assert.is(statusCode, 200);
    assert.is(data, '538000000');
    assert.is(headers['cache-control'], 'public,s-maxage=31536000,immutable');
  });

  it('/kswap/circulating-supply', async () => {
    const {statusCode, data, headers} = await get('/kswap/circulating-supply');

    assert.is(statusCode, 200);
    assert.match(data, /^\d+/);
    assert.is(headers['cache-control'], 'public,s-maxage=86400');
  });

  it('/kswap/circulating-supply-whole', async () => {
    const {statusCode, data, headers} = await get('/kswap/circulating-supply-whole');

    assert.is(statusCode, 200);
    assert.match(data, /^\d+/);
    assert.is(headers['cache-control'], 'public,s-maxage=86400');
  });

  it('/kswap/community-treasury', async () => {
    const {statusCode, data, headers} = await get('/kswap/community-treasury');

    assert.is(statusCode, 200);
    assert.match(data, /^\d+/);
    assert.is(headers['cache-control'], 'public,s-maxage=3600');
  });

  it('/kswap/community-treasury-whole', async () => {
    const {statusCode, data, headers} = await get('/kswap/community-treasury-whole');

    assert.is(statusCode, 200);
    assert.match(data, /^\d+/);
    assert.is(headers['cache-control'], 'public,s-maxage=3600');
  });
});

describe('/v2/:chain/kswap', (it) => {
  it('/v2/3888/kswap/tvl', async () => {
    const {statusCode, data, headers} = await get('/v2/3888/kswap/tvl');

    assert.is(statusCode, 200);
    assert.match(data, /^[.?\d]+/);
    assert.is(headers['cache-control'], 'public,s-maxage=300');
  });

  it('/v2/3888/kswap/total-volume', async () => {
    const {statusCode, data, headers} = await get('/v2/3888/kswap/total-volume');

    assert.is(statusCode, 200);
    assert.match(data, /^[.?\d]+/);
    assert.is(headers['cache-control'], 'public,s-maxage=300');
  });

  it('/v2/3888/kswap/total-supply', async () => {
    const {statusCode, data, headers} = await get('/v2/3888/kswap/total-supply');

    assert.is(statusCode, 200);
    assert.is(data, '538000000000000000000000000');
    assert.is(headers['cache-control'], 'public,s-maxage=31536000,immutable');
  });

  it('/v2/3888/kswap/total-supply-whole', async () => {
    const {statusCode, data, headers} = await get('/v2/3888/kswap/total-supply-whole');

    assert.is(statusCode, 200);
    assert.is(data, '538000000');
    assert.is(headers['cache-control'], 'public,s-maxage=31536000,immutable');
  });

  it('/v2/3888/kswap/circulating-supply', async () => {
    const {statusCode, data, headers} = await get('/v2/3888/kswap/circulating-supply');

    assert.is(statusCode, 200);
    assert.match(data, /^\d+/);
    assert.is(headers['cache-control'], 'public,s-maxage=86400');
  });

  it('/v2/3888/kswap/circulating-supply-whole', async () => {
    const {statusCode, data, headers} = await get('/v2/3888/kswap/circulating-supply-whole');

    assert.is(statusCode, 200);
    assert.match(data, /^\d+/);
    assert.is(headers['cache-control'], 'public,s-maxage=86400');
  });

  it('/v2/3888/kswap/community-treasury', async () => {
    const {statusCode, data, headers} = await get('/v2/3888/kswap/community-treasury');

    assert.is(statusCode, 200);
    assert.match(data, /^\d+/);
    assert.is(headers['cache-control'], 'public,s-maxage=3600');
  });

  it('/v2/3888/kswap/community-treasury-whole', async () => {
    const {statusCode, data, headers} = await get('/v2/3888/kswap/community-treasury-whole');

    assert.is(statusCode, 200);
    assert.match(data, /^\d+/);
    assert.is(headers['cache-control'], 'public,s-maxage=3600');
  });
});

describe('/kalyswap', (it) => {
  // Timeout issues
  // it('/kalyswap/addresses', async () => {
  //   const {statusCode, data, headers} = await get('/kalyswap/addresses', {
  //     timeout: 60_000,
  //   });
  //
  //   assert.is(statusCode, 200);
  //   assert.match(data, /^[.?\d]+/);
  //   assert.is(headers['cache-control'], 'public,s-maxage=86400');
  // });

  it('/kalyswap/transaction-average', async () => {
    const {statusCode, data, headers} = await get('/kalyswap/transaction-average');

    assert.is(statusCode, 200);
    assert.match(data, /^[.?\d]+/);
    assert.is(headers['cache-control'], 'public,s-maxage=86400');
  });

  it(`/kalyswap/apr/:address`, async () => {
    const {statusCode, data, headers} = await get(
      '/kalyswap/apr/0xDbfD50b15cE8249AE736cEB259927E77fEc231bF',
    );

    assert.is(statusCode, 200);
    assert.ok(data.swapFeeApr !== undefined);
    assert.ok(data.stakingApr !== undefined);
    assert.ok(data.combinedApr !== undefined);
    assert.is(headers['content-type'], 'application/json;charset=utf-8');
  });

  it(`/kalyswap/apr2/:pid`, async () => {
    const {statusCode, data, headers} = await get(`/kalyswap/apr2/0`);

    assert.is(statusCode, 200);
    assert.ok(data.swapFeeApr !== undefined);
    assert.ok(data.stakingApr !== undefined);
    assert.ok(data.combinedApr !== undefined);
    assert.is(headers['content-type'], 'application/json;charset=utf-8');
  });
});

describe('/v2/:chain/kalyswap', (it) => {
  // Timeout issues
  // it('/v2/3888/kalyswap/addresses', async () => {
  //   const {statusCode, data, headers} = await get('/v2/3888/kalyswap/addresses', {
  //     timeout: 60_000,
  //   });
  //
  //   assert.is(statusCode, 200);
  //   assert.match(data, /^[.?\d]+/);
  //   assert.is(headers['cache-control'], 'public,s-maxage=86400');
  // });

  it('/v2/3888/kalyswap/transaction-average', async () => {
    const {statusCode, data, headers} = await get('/v2/3888/kalyswap/transaction-average');

    assert.is(statusCode, 200);
    assert.match(data, /^[.?\d]+/);
    assert.is(headers['cache-control'], 'public,s-maxage=86400');
  });

  it(`/v2/3888/kalyswap/apr/:pid`, async () => {
    const {statusCode, data, headers} = await get(`/v2/3888/kalyswap/apr/0`);

    assert.is(statusCode, 200);
    assert.ok(data.swapFeeApr !== undefined);
    assert.ok(data.stakingApr !== undefined);
    assert.ok(data.combinedApr !== undefined);
    assert.is(headers['content-type'], 'application/json;charset=utf-8');
  });

  it(`/v2/3888/kalyswap/aprs/:pids`, async () => {
    const pids = [0, 1, 2, 3];

    const {statusCode, data, headers} = await get(`/v2/3888/kalyswap/aprs/${pids.join(',')}`);

    assert.is(statusCode, 200);
    assert.equal(data.length, pids.length);

    for (let i = 0; i < pids.length; i++) {
      assert.ok(data[i].swapFeeApr !== undefined);
      assert.ok(data[i].stakingApr !== undefined);
      assert.ok(data[i].combinedApr !== undefined);
    }

    assert.is(headers['content-type'], 'application/json;charset=utf-8');
  });
});
