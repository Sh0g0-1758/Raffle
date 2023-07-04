const { network, ethers } = require("hardhat");
const {
	networkConfig,
	developmentChains,
	VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

const FUND_AMOUNT = ethers.parseEther("1");

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainId = network.config.chainId;
	let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock;

	if (chainId == 31337 || chainId == 1337) {
		vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
		vrfCoordinatorV2Address = vrfCoordinatorV2Mock.runner.address;
		const transactionResponse =
			await vrfCoordinatorV2Mock.createSubscription();
		const transactionReceipt = await transactionResponse.wait(1);
		subscriptionId = transactionReceipt.logs[0].args[0];
		await vrfCoordinatorV2Mock.fundSubscription(
			subscriptionId,
			FUND_AMOUNT
		);
	} else {
		vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
		subscriptionId = networkConfig[chainId]["subscriptionId"];
	}
	const waitBlockConfirmations = developmentChains.includes(network.name)
		? 1
		: VERIFICATION_BLOCK_CONFIRMATIONS;

	log("----------------------------------------------------");
	const arguments = [
		vrfCoordinatorV2Address,
		subscriptionId,
		networkConfig[chainId]["gasLane"],
		networkConfig[chainId]["keepersUpdateInterval"],
		networkConfig[chainId]["raffleEntranceFee"],
		networkConfig[chainId]["callbackGasLimit"],
	];

	const raffle = await deploy("Raffle", {
		from: deployer,
		args: arguments,
		log: true,
		waitConfirmations: waitBlockConfirmations,
	});

	// Ensure the Raffle contract is a valid consumer of the VRFCoordinatorV2Mock contract.
	if (developmentChains.includes(network.name)) {
		const vrfCoordinatorV2Mock = await ethers.getContract(
			"VRFCoordinatorV2Mock"
		);
		await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address);
	}

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		log("Verifying...");
		await verify(raffle.address, arguments);
	}

	log("Enter lottery with command:");
	const networkName = network.name == "hardhat" ? "localhost" : network.name;
	log(`yarn hardhat run scripts/enterRaffle.js --network ${networkName}`);
	log("----------------------------------------------------");
};

module.exports.tags = ["all", "raffle"];
