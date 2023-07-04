/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();


const sepolia_url = process.env.sepolia_rpc_url;
const private_key = process.env.PRIVATE_KEY;
const etherscanKey = process.env.etherscan_api_key;
const coin_market_cap_key = process.env.coin_market_cap_key;

module.exports = {
	solidity: "0.8.18",
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {
			blockConfirmations : 1,
			chainId: 31337,
		},
		localhost: {
			url: "HTTP://127.0.0.1:7545",
			accounts: ["0xed27420d96e524a6ef18c5dfad068ec328d6f0fc3c930ce18887fb695de63d4d"],
			blockConfirmations : 1,
			chainId: 1337,
		},
		sepolia: {
			url: sepolia_url,
			accounts: [private_key],
			blockConfirmations : 6,
			chainId: 11155111,
		},
	},
	namedAccounts: {
		deployer: {
			default: 0,
		},
		player: {
			default: 1,
		},
	},
};