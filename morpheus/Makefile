# make sepolia
sepolia:
	- rm -R ./ignition/deployments
	- npx hardhat compile
	- npx hardhat ignition deploy ./ignition/modules/Betting.ts --network sepolia

local:
	- rm -R ./ignition/deployments
	- npx hardhat compile
	- npx hardhat ignition deploy ./ignition/modules/Betting.ts --network localhost

# make verify ADDRESS=<contract-address>
verify: 
	- npx hardhat verify ${ADDRESS} --network sepolia