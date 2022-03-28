// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
require('dotenv').config();

const hre = require("hardhat");
const { ethers } = require('hardhat');

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

const toBytes32 = function (string) {
  return ethers.utils.formatBytes32String(string);
}
const fromBytes32 = function (string) {
  return ethers.utils.parseBytes32String(string);
}

const parseUnits = function (number, units) {
  return ethers.utils.parseUnits(number, units || 8);
}

const formatUnits = function (number, units) {
  return ethers.utils.formatUnits(number, units || 8);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const provider = hre.ethers.provider;
  const signer = await provider.getSigner();

  const account = await signer.getAddress();
  console.log('account', account);
  console.log('Account balance', formatUnits(await provider.getBalance(account)));

  const routerAddress = process.env.NEW_POOL_ROUTER_ADDR;
  const router = await (await ethers.getContractFactory("Router")).attach(routerAddress);

  const usdc = {address: process.env.NEW_POOL_USDC_ADDR};
  console.log("usdc:", usdc.address);

  // // Pools (WETH, USDC)
  // const Pool = await hre.ethers.getContractFactory("Pool");
  
  // const poolETH = await Pool.deploy(ADDRESS_ZERO);
  // await poolETH.deployed();
  // console.log("poolETH deployed to:", poolETH.address);

  // const poolUSDC = await Pool.deploy(usdc.address);
  // await poolUSDC.deployed();
  // console.log("poolUSDC deployed to:", poolUSDC.address);

  // // Rewards

  // const Rewards = await hre.ethers.getContractFactory("Rewards");

  // // Rewards for Pools
  // const poolRewardsETH = await Rewards.deploy(poolETH.address, ADDRESS_ZERO);
  // await poolRewardsETH.deployed();
  // console.log("poolRewardsETH deployed to:", poolRewardsETH.address);

  // const poolRewardsUSDC = await Rewards.deploy(poolUSDC.address, usdc.address);
  // await poolRewardsUSDC.deployed();
  // console.log("poolRewardsUSDC deployed to:", poolRewardsUSDC.address);

  // Router

  const poolETH = await (await ethers.getContractFactory("Pool")).attach(process.env.NEW_POOL_ETHPOOL_ADDR);
  const poolUSDC = await (await ethers.getContractFactory("Pool")).attach(process.env.NEW_POOL_USDCPOOL_ADDR);
  const poolRewardsETH = await (await ethers.getContractFactory("Rewards")).attach(process.env.NEW_POOL_ETHPOOL_REWARDS_ADDR);
  const poolRewardsUSDC = await (await ethers.getContractFactory("Rewards")).attach(process.env.NEW_POOL_USDCPOOL_REWARDS_ADDR);


  await router.setPool(ADDRESS_ZERO, process.env.NEW_POOL_ETHPOOL_ADDR);
  await router.setPool(usdc.address, process.env.NEW_POOL_USDCPOOL_ADDR);

  await router.setPoolRewards(ADDRESS_ZERO, process.env.NEW_POOL_ETHPOOL_REWARDS_ADDR);
  await router.setPoolRewards(usdc.address, process.env.NEW_POOL_USDCPOOL_REWARDS_ADDR);

  console.log("Setup router contracts");

  // Link contracts with Router, which also sets their dependent contract addresses
  await poolETH.setRouter(router.address);
  await poolUSDC.setRouter(router.address);
  await poolRewardsETH.setRouter(router.address);
  await poolRewardsUSDC.setRouter(router.address);

  console.log("Linked router with contracts");

  const network = hre.network.name;
  console.log('network', network);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});