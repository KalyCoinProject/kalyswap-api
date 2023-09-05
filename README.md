# Kalyswap API

API for querying key values for Kalyswap and the KSWAP token

## Development

[Wrangler](https://developers.cloudflare.com/workers/cli-wrangler) is used for a local development server. This is effectively a proxy-service that (nearly) replicates the Cloudflare Worker runtime.

Anyone can develop this repository locally. Fill in `account_id` in the `wrangler.toml` file. This value may (and should) be your own personal `account_id`.

## Location

The API is available at `https://api.kalyswap.io`

## Methods

All methods accept a GET request.

### Kalyswap TVL

Get the total value locked in Kalyswap in USD.

Endpoint: `/kswap/tvl`

Example call: `curl --location --request GET 'https://api.kalyswap.io/kswap/tvl'`

### Kalyswap Volume

Get the total lifetime volume of swaps on Kalyswap in USD.

Endpoint: `/kswap/total-volume`

Example call: `curl --location --request GET 'https://api.kalyswap.io/kswap/total-volume'`

### KSWAP Total Supply

Get the total lifetime supply of KSWAP. KSWAP is a hard-capped asset and this value will never increase.

#### 18 Decimal Denomination

The KSWAP token has 18 decimals. Query the total supply denominated in units of "wei." With this method, a result of 1 KSWAP would return the value `1000000000000000000`.

Endpoint: `/kswap/total-supply`

Example call: `curl --location --request GET 'https://api.kalyswap.io/kswap/total-supply'`

#### Whole Token Denomination

The KSWAP token has 18 decimals. Query the total supply denominated in units of whole KSWAP. With this method, a result of 1 KSWAP would return the value `1`.

Endpoint: `/kswap/total-supply-whole`

Example call: `curl --location --request GET 'https://api.kalyswap.io/kswap/total-supply-whole'`

### KSWAP Circulating Supply

Get the current circulating supply of KSWAP. This value is calculated to be the total supply of KSWAP minus the locked, unvested KSWAP and also excludes the locked Kalyswap community treasury.

#### 18 Decimal Denomination

The KSWAP token has 18 decimals. Query the circulating supply denominated in units of "wei." With this method, a result of 1 KSWAP would return the value `1000000000000000000`.

Endpoint: `/kswap/circulating-supply`

Example call: `curl --location --request GET 'https://api.kalyswap.io/kswap/circulating-supply'`

#### Whole Token Denomination

The KSWAP token has 18 decimals. Query the circulating supply denominated in units of whole KSWAP. With this method, a result of 1 KSWAP would return the value `1`.

Endpoint: `/kswap/circulating-supply-whole`

Example call: `curl --location --request GET 'https://api.kalyswap.io/kswap/circulating-supply-whole'`

### Kalyswap Community Treasury Supply

Get the current KSWAP supply of the Kalyswap Community Treasury.

#### 18 Decimal Denomination

The KSWAP token has 18 decimals. Query the balance denominated in units of "wei." With this method, a result of 1 KSWAP would return the value `1000000000000000000`.

Endpoint: `/kswap/community-treasury`

Example call: `curl --location --request GET 'https://api.kalyswap.io/kswap/community-treasury'`

#### Whole Token Denomination

The KSWAP token has 18 decimals. Query the circulating supply denominated in units of whole KSWAP. With this method, a result of 1 KSWAP would return the value `1`.

Endpoint: `/kswap/community-treasury-whole`

Example call: `curl --location --request GET 'https://api.kalyswap.io/kswap/community-treasury-whole'`

### Kalyswap Number of Address

Get the total lifetime number of unique address to transact on Kalyswap.

Endpoint: `/kalyswap/addresses`

Example call: `curl --location --request GET 'https://api.kalyswap.io/kalyswap/addresses'`

### Kalyswap Average Swap Size

Get the average size of each swap on Kalyswap in USD.

Endpoint: `/kalyswap/transaction-average`

Example call: `curl --location --request GET 'https://api.kalyswap.io/kalyswap/transaction-average'`

### Kalyswap Median Swap Size

Get the median size of each swap on Kalyswap in USD.

Endpoint: `/kalyswap/transaction-median`

Example call: `curl --location --request GET 'https://api.kalyswap.io/kalyswap/transaction-median'`

### Kalyswap Average Percentage Reward Rate

Get the KSWAP Reward Rate of the inputted StakingRewards contract address.
Refer to [KalyScan](https://kalyscan.io/address/0xA9f1eB89452f825Bbc59007FAe13233953910582#readContract) to find pIDs(pool ids).

Endpoint: `/kalyswap/apr2/{pID}`

Example call: `curl --location --request GET 'https://api.kalyswap.io/kalyswap/apr2/1'`
