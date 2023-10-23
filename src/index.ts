import {Router} from 'worktop';
import * as Cache from 'worktop/cache';
import * as CORS from 'worktop/cors';
import {send} from 'worktop/response';
import * as Kalyswap from './handlers/kalyswap';
import * as Kswap from './handlers/kswap';
import { getKlcPrice } from './handlers/getPrice'

const API = new Router();

API.prepare = CORS.preflight({
  origin: true,
  headers: ['Cache-Control', 'Content-Type'],
  methods: ['GET'],
});

API.add('GET', '/', () => {
  const text = 'Refer to https://github.com/kalycoinproject/kalyswap-api for documentation.';

  return send(200, text, {
    'Cache-Control': 'public,s-maxage=31536000,immutable',
  });
});

// Legacy API
API.add('GET', '/kswap/tvl', Kswap.tvl);
API.add('GET', '/kswap/total-volume', Kswap.volume);
API.add('GET', '/kswap/total-supply', Kswap.supply);
API.add('GET', '/kswap/total-supply-whole', Kswap.supplyWhole);
API.add('GET', '/kswap/circulating-supply', Kswap.circulating);
API.add('GET', '/kswap/circulating-supply-whole', Kswap.circulatingWhole);
API.add('GET', '/kswap/community-treasury', Kswap.treasury);
API.add('GET', '/kswap/community-treasury-whole', Kswap.treasuryWhole);
API.add('GET', '/kalyswap/addresses', Kalyswap.addresses);
API.add('GET', '/kalyswap/transaction-average', Kalyswap.average);
API.add('GET', '/kalyswap/apr/:address', Kalyswap.aprLegacy);
API.add('GET', '/kalyswap/apr2/:pid', Kalyswap.aprChef);
API.add('GET', '/kalyswap/stakingTokenAddresses', Kalyswap.stakingTokenAddresses);
API.add('GET', '/kalyswap/klc-price', getKlcPrice); 

// V2 API
API.add('GET', '/v2/:chain/kswap/tvl', Kswap.tvl);
API.add('GET', '/v2/:chain/kswap/total-volume', Kswap.volume);
API.add('GET', '/v2/:chain/kswap/total-supply', Kswap.supply);
API.add('GET', '/v2/:chain/kswap/total-supply-whole', Kswap.supplyWhole);
API.add('GET', '/v2/:chain/kswap/circulating-supply', Kswap.circulating);
API.add('GET', '/v2/:chain/kswap/circulating-supply-whole', Kswap.circulatingWhole);
API.add('GET', '/v2/:chain/kswap/community-treasury', Kswap.treasury);
API.add('GET', '/v2/:chain/kswap/community-treasury-whole', Kswap.treasuryWhole);
API.add('GET', '/v2/:chain/kalyswap/addresses', Kalyswap.addresses);
API.add('GET', '/v2/:chain/kalyswap/transaction-average', Kalyswap.average);
API.add('GET', '/v2/:chain/kalyswap/apr/:pid', Kalyswap.aprChef);
API.add('GET', '/v2/:chain/kalyswap/aprs/:pids', Kalyswap.aprChefMultiple);
API.add('GET', '/v2/:chain/kalyswap/stakingTokenAddresses', Kalyswap.stakingTokenAddresses);
API.add('GET', 'v2/:chain/kalyswap/klc-price', getKlcPrice);

Cache.listen(async (event) => {
  return API.run(event.request, event);
});
