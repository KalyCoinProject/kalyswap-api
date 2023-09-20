import * as QUERIES from './queries';

export async function getTokenPriceKLC(url: string | undefined, address: string): Promise<string> {
  const response = await request(QUERIES.TOKEN_PRICE, url, {
    address: address.toLowerCase(),
  });
  return response.token.derivedKLC;
}

export async function getTokenInfo(
  url: string | undefined,
  address: string,
): Promise<{decimals: string; derivedKLC: string}> {
  const response = await request(QUERIES.TOKEN_INFO, url, {
    address: address.toLowerCase(),
  });
  return {
    decimals: response.token.decimals,
    derivedKLC: response.token.derivedKLC,
  };
}

export async function getPairPriceUSD(url: string | undefined, address: string): Promise<string> {
  const response = await request(QUERIES.PAIR_VALUE, url, {
    address: address.toLowerCase(),
  });
  return response.pair.reserveUSD;
}

export async function getKLCPrice(url: string | undefined): Promise<string> {
  const response = await request(QUERIES.KLC_PRICE, url);
  return response.bundle.klcPrice;
}

export async function request(query: string, url: string | undefined, variables = {}) {
  if (url === undefined) {
    throw new Error(`Missing subgraph url`);
  }

  const _ = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (_.status !== 200) {
    const message = `[${_.statusText}]: Error querying ${query}`;
    console.error(message);
    throw new Error(message);
  }

  const {data} = await _.json();

  return data;
}
