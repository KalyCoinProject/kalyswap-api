import {BigNumber} from '@ethersproject/bignumber';
import type {Handler} from 'worktop';
import {send} from 'worktop/response';
import {EIGHTEEN, ONE_TOKEN, ZERO, ZERO_ADDRESS} from '../constants';
import {
  getBalance,
  getPoolInfoFromMiniChefV2,
  getPoolInfosFromMiniChefV2,
  getRewarder,
  getRewarderViaMultiplierRewardTokens,
  getRewardPerSecondFromMiniChefV2,
  getStakingTokenAddressesFromMiniChefV2,
  getStakingTokenAddressFromMiniChefV2,
  getTotalAllocationPointsFromMiniChefV2,
  getTotalSupply,
  getRewarderViaMultiplierRewardMultipliers,
} from '../utils/calls';
import {ChainInfo, getChainInfo} from '../utils/chain';
import {convertStringToBigNumber, expandTo18Decimals} from '../utils/conversion';
import * as gql from '../utils/gql';
import {getKLCPrice, getPairPriceUSD, getTokenInfo, getTokenPriceKLC} from '../utils/gql';
import * as QUERIES from '../utils/queries';
import {AprResponse, PoolInfo} from '../utils/interfaces';

export const addresses: Handler = async (_, context) => {
  const chainInfo = getChainInfo(context.params.chain);

  let number_addresses = 0;
  let new_addrs = 0;
  let firstUser = ZERO_ADDRESS;

  do {
    const {users} = await gql.request(QUERIES.USER, chainInfo.subgraph_exchange, {
      first: 1000,
      firstUser,
      orderBy: 'id',
    });
    firstUser = users[users.length - 1].id;
    new_addrs = users.length;
    number_addresses += new_addrs;
  } while (new_addrs === 1000);

  return send(200, number_addresses, {
    'Cache-Control': 'public,s-maxage=86400',
  });
};

export const average: Handler = async (_, context) => {
  const chainInfo = getChainInfo(context.params.chain);

  const result = await gql.request(
    QUERIES._FACTORY(chainInfo.factory),
    chainInfo.subgraph_exchange,
  );
  const {totalVolumeUSD, txCount} = result.kalyswapFactories[0];

  const text = (Number.parseFloat(totalVolumeUSD) / Number.parseInt(txCount, 10)).toFixed(2);

  return send(200, text, {
    'Cache-Control': 'public,s-maxage=86400',
  });
};

export const aprLegacy: Handler = async () => {
  const aprs = {
    swapFeeApr: 0,
    stakingApr: 0,
    combinedApr: 0,
  };

  return send(200, aprs, {
    'Cache-Control': 'public,s-maxage=86400',
  });
};

export const aprChef: Handler = async (_, context) => {
  const chainInfo = getChainInfo(context.params.chain);

  const poolId = context.params.pid;

  const stakingTokenAddress = await getStakingTokenAddressFromMiniChefV2(
    chainInfo.rpc,
    chainInfo.mini_chef,
    poolId,
  );

 // Number of days to average swap volume from
const days = 7;

// Fetch pair day data
const pairDayDataResponse = await gql.request(QUERIES.DAILY_VOLUME, chainInfo.subgraph_exchange, {
  days,
  pairAddress: stakingTokenAddress,
});
const pairDayDatas = pairDayDataResponse.pairDayDatas;

// Fetch pool info
const poolInfo = await getPoolInfoFromMiniChefV2(chainInfo.rpc, chainInfo.mini_chef, poolId);

// Fetch total allocation points
const totalAllocPoints = await getTotalAllocationPointsFromMiniChefV2(chainInfo.rpc, chainInfo.mini_chef);

// Fetch reward per second
const rewardPerSecond = await getRewardPerSecondFromMiniChefV2(chainInfo.rpc, chainInfo.mini_chef);


  const farmAllocPoints: BigNumber = poolInfo.allocPoint;
  const isActiveChef: boolean = totalAllocPoints.gt(ZERO) && rewardPerSecond.gt(ZERO);
  const isActiveFarm: boolean = isActiveChef && farmAllocPoints.gt(ZERO);

  const [_klcPrice, _derivedKswap, pairValueUSD, rewarderAddress, kslTotalSupply, kslStaked] =
    await Promise.all([
      // Variable: _klcPrice
      isActiveFarm ? getKLCPrice(chainInfo.subgraph_exchange) : Promise.resolve('0') as Promise<string>,

      // Variable: _derivedKswap
      isActiveFarm ? getTokenPriceKLC(chainInfo.subgraph_exchange, chainInfo.kswap) : Promise.resolve('0') as Promise<string>,

      // Variable: pairValueUSD
      isActiveFarm ? getPairPriceUSD(chainInfo.subgraph_exchange, stakingTokenAddress) : Promise.resolve('0') as Promise<string>,

      // Variable: rewarderAddress
      isActiveFarm ? getRewarder(chainInfo.rpc, chainInfo.mini_chef, poolId) : Promise.resolve(ZERO_ADDRESS) as Promise<string>,

      // Variable: kslTotalSupply
      isActiveFarm ? getTotalSupply(chainInfo.rpc, stakingTokenAddress) : Promise.resolve(ZERO) as Promise<BigNumber>,

      // Variable: kslStaked
      isActiveFarm ? getBalance(chainInfo.rpc, stakingTokenAddress, chainInfo.mini_chef) : Promise.resolve(ZERO) as Promise<BigNumber>,
    ]);




  const klcPrice = convertStringToBigNumber(_klcPrice, 0, 18);
  const kswapPrice = convertStringToBigNumber(_derivedKswap, 0, 18).mul(klcPrice).div(ONE_TOKEN);

  // Process additional SuperFarm rewards (if any)
  const extraRewardTokensPerSecondInKSWAP = await getRewarderTokensPerSecondInKSWAP(
    chainInfo,
    rewarderAddress,
    rewardPerSecond,
    totalAllocPoints,
    farmAllocPoints,
    klcPrice,
    kswapPrice,
  );

  let stakedKSWAP = ZERO;

  if (isActiveFarm && kslTotalSupply.gt(ZERO) && kswapPrice.gt(ZERO)) {
    const pairValueInKSWAP: BigNumber = convertStringToBigNumber(pairValueUSD, 0, 18)
      .mul(ONE_TOKEN)
      .div(kswapPrice);
    stakedKSWAP = pairValueInKSWAP.mul(kslStaked).div(kslTotalSupply);
  }

  const poolRewardPerSecInKSWAP: BigNumber = rewardPerSecond
    .mul(farmAllocPoints)
    .div(totalAllocPoints);
  const stakingAPR: BigNumber = stakedKSWAP.isZero()
    ? ZERO
    : poolRewardPerSecInKSWAP
        .add(extraRewardTokensPerSecondInKSWAP)
        // Percentage
        .mul(100)
        // Calculate reward rate per year
        .mul(60 * 60 * 24 * 365)
        // Divide by amount staked to get APR
        .div(stakedKSWAP);

  let swapVolumeUSD = ZERO;
  let liquidityUSD = ZERO;

  for (const {dailyVolumeUSD, reserveUSD} of pairDayDatas) {
    swapVolumeUSD = swapVolumeUSD.add(Math.floor(dailyVolumeUSD));
    liquidityUSD = liquidityUSD.add(Math.floor(reserveUSD));
  }

  const fees = swapVolumeUSD.mul(365).div(pairDayDatas.length).mul(3).div(1000);
  const averageLiquidityUSD = liquidityUSD.div(pairDayDatas.length);
  const swapFeeAPR = averageLiquidityUSD.isZero() ? ZERO : fees.mul(100).div(averageLiquidityUSD);

  const apr: AprResponse = {
    swapFeeApr: swapFeeAPR.toNumber(),
    stakingApr: stakingAPR.toNumber(),
    combinedApr: stakingAPR.add(swapFeeAPR).toNumber(),
  };

  return send(200, apr, {
    'Cache-Control': 'public,s-maxage=900',
  });
};

export const aprChefMultiple: Handler = async (_, context) => {
  const chainInfo = getChainInfo(context.params.chain);

  const poolIds: string[] = context.params.pids.split(',');

  if (poolIds.length > 4) {
    throw new Error('Too many pids');
  }

  // Number of days to average swap volume from
  const days = 7;

  // Singular data
const [_klcPrice, _derivedKswap, lpTokens, poolInfos, rewardPerSecond, totalAllocPoints] =
await Promise.all([
  // Variable: _klcPrice
  getKLCPrice(chainInfo.subgraph_exchange) as Promise<string>,

  // Variable: _derivedKswap
  getTokenPriceKLC(chainInfo.subgraph_exchange, chainInfo.kswap) as Promise<string>,

  // Variable: _lpTokens
  getStakingTokenAddressesFromMiniChefV2(chainInfo.rpc, chainInfo.mini_chef) as Promise<string[]>,

  // Variable: poolInfos
  getPoolInfosFromMiniChefV2(chainInfo.rpc, chainInfo.mini_chef) as Promise<PoolInfo[]>,

  // Variable: rewardPerSecond
  getRewardPerSecondFromMiniChefV2(chainInfo.rpc, chainInfo.mini_chef) as Promise<BigNumber>,

  // Variable: totalAllocPoints
  getTotalAllocationPointsFromMiniChefV2(chainInfo.rpc, chainInfo.mini_chef) as Promise<BigNumber>,
]);


  // Format singular data
  const klcPrice: BigNumber = convertStringToBigNumber(_klcPrice, 0, 18);
  const kswapPrice: BigNumber = convertStringToBigNumber(_derivedKswap, 0, 18)
    .mul(klcPrice)
    .div(ONE_TOKEN);
  const isActiveChef: boolean = totalAllocPoints.gt(ZERO) && rewardPerSecond.gt(ZERO);

  const aprs: AprResponse[] = [];

  // Iterated data
  for (const poolId of poolIds) {
    const pid: number = Number.parseInt(poolId, 10);
    if (pid < 0 || pid >= lpTokens.length) {
      throw new Error(`Invalid pid ${pid}`);
    }

    const stakingTokenAddress: string = lpTokens[pid];
    const farmAllocPoints: BigNumber = poolInfos[pid].allocPoint;
    const isActiveFarm: boolean = isActiveChef && farmAllocPoints.gt(ZERO);
    const [{pairDayDatas}, pairValueUSD, rewarderAddress, kslTotalSupply, kslStaked] =
      await Promise.all([
        // Variable: {pairDayDatas}
        gql.request(QUERIES.DAILY_VOLUME, chainInfo.subgraph_exchange, {
          days,
          pairAddress: stakingTokenAddress,
        }),

        // Variable: pairValueUSD,
        isActiveFarm ? getPairPriceUSD(chainInfo.subgraph_exchange, stakingTokenAddress) : '0',

        // Variable: rewarderAddress
        isActiveFarm
          ? getRewarder(chainInfo.rpc, chainInfo.mini_chef, pid.toString())
          : ZERO_ADDRESS,

        // Variable: kslTotalSupply
        isActiveFarm ? getTotalSupply(chainInfo.rpc, stakingTokenAddress) : ZERO,

        // Variable: kslStaked
        isActiveFarm ? getBalance(chainInfo.rpc, stakingTokenAddress, chainInfo.mini_chef) : ZERO,
      ]);

    // Process additional SuperFarm rewards (if any)
    const extraRewardTokensPerSecondInKSWAP = await getRewarderTokensPerSecondInKSWAP(
      chainInfo,
      rewarderAddress,
      rewardPerSecond,
      totalAllocPoints,
      farmAllocPoints,
      klcPrice,
      kswapPrice,
    );

    let stakedKSWAP = ZERO;

    if (isActiveFarm && kslTotalSupply.gt(ZERO) && kswapPrice.gt(ZERO)) {
      const pairValueInKSWAP: BigNumber = convertStringToBigNumber(pairValueUSD, 0, 18)
        .mul(ONE_TOKEN)
        .div(kswapPrice);
      stakedKSWAP = pairValueInKSWAP.mul(kslStaked).div(kslTotalSupply);
    }

    const poolRewardPerSecInKSWAP: BigNumber = rewardPerSecond
      .mul(farmAllocPoints)
      .div(totalAllocPoints);
    const stakingAPR: BigNumber = stakedKSWAP.isZero()
      ? ZERO
      : poolRewardPerSecInKSWAP
          .add(extraRewardTokensPerSecondInKSWAP)
          // Percentage
          .mul(100)
          // Calculate reward rate per year
          .mul(60 * 60 * 24 * 365)
          // Divide by amount staked to get APR
          .div(stakedKSWAP);

    let swapVolumeUSD = ZERO;
    let liquidityUSD = ZERO;

    for (const {dailyVolumeUSD, reserveUSD} of pairDayDatas) {
      swapVolumeUSD = swapVolumeUSD.add(Math.floor(dailyVolumeUSD));
      liquidityUSD = liquidityUSD.add(Math.floor(reserveUSD));
    }

    const fees = swapVolumeUSD.mul(365).div(pairDayDatas.length).mul(3).div(1000);
    const averageLiquidityUSD = liquidityUSD.div(pairDayDatas.length);
    const swapFeeAPR = averageLiquidityUSD.isZero() ? ZERO : fees.mul(100).div(averageLiquidityUSD);

    aprs.push({
      swapFeeApr: swapFeeAPR.toNumber(),
      stakingApr: stakingAPR.toNumber(),
      combinedApr: stakingAPR.add(swapFeeAPR).toNumber(),
    });
  }

  return send(200, aprs, {
    'Cache-Control': 'public,s-maxage=900',
  });
};

export const stakingTokenAddresses: Handler = async (_, context) => {
  const chainInfo = getChainInfo(context.params.chain);

  const stakingTokenAddresses = await getStakingTokenAddressesFromMiniChefV2(
    chainInfo.rpc,
    chainInfo.mini_chef,
  );
  return send(200, stakingTokenAddresses, {
    'Cache-Control': 'public,s-maxage=216000',
  });
};

async function getRewarderTokensPerSecondInKSWAP(
  chainInfo: ChainInfo,
  rewarderAddress: string,
  rewardPerSecond: BigNumber,
  totalAllocPoints: BigNumber,
  farmAllocPoints: BigNumber,
  klcPrice: BigNumber,
  kswapPrice: BigNumber,
): Promise<BigNumber> {
  // No rewarder means no extra rewards
  if (rewarderAddress === ZERO_ADDRESS) return ZERO;

  const [rewardAddresses, rewardMultipliers] = await Promise.all([
    getRewarderViaMultiplierRewardTokens(chainInfo.rpc, rewarderAddress) as Promise<string[]>,
    getRewarderViaMultiplierRewardMultipliers(chainInfo.rpc, rewarderAddress) as Promise<BigNumber[]>,
]);

  const rewardInfos = await Promise.all<{decimals: BigNumber; price: BigNumber}>(
    rewardAddresses.map(async (address: string) => {
      try {
        const {decimals, derivedKLC} = await getTokenInfo(chainInfo.subgraph_exchange, address);
        return {
          price: convertStringToBigNumber(derivedKLC, 0, 18).mul(klcPrice).div(kswapPrice),
          decimals: BigNumber.from(decimals),
        };
      } catch {
        // Failsafe for when a reward token does not exist in the subgraph
        return {price: ZERO, decimals: EIGHTEEN};
      }
    }),
  );

  const rewardDecimals = rewardInfos.map(({decimals}) => decimals);
  const rewardPricesInKSWAP = rewardInfos.map(({price}) => price);

  let extraRewardTokensPerSecondInKSWAP = ZERO;
  const baseRewardPerSecond = rewardPerSecond.mul(farmAllocPoints).div(totalAllocPoints);

  for (let i = 0; i < rewardAddresses.length; i++) {
    const rewardPerSecInReward: BigNumber = baseRewardPerSecond
      .mul(rewardMultipliers[i])
      .div(ONE_TOKEN)
      .mul(rewardPricesInKSWAP[i])
      .div(ONE_TOKEN);

    const rewardPerSecInKSWAP = expandTo18Decimals(rewardPerSecInReward, rewardDecimals[i]);
    extraRewardTokensPerSecondInKSWAP = extraRewardTokensPerSecondInKSWAP.add(rewardPerSecInKSWAP);
  }

  return extraRewardTokensPerSecondInKSWAP;
}

// Export getKLCPrice for use in other modules
export { getKLCPrice };