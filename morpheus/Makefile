# make sepolia
sepolia:
	- rm -R ./ignition/deployments
	- npx hardhat compile
	- npx hardhat ignition deploy ./ignition/modules/Betting.ts --network sepolia

local:
	- rm -R ./ignition/deployments
	- npx hardhat compile
	- npx hardhat ignition deploy ./ignition/modules/Betting.ts --network localhost

sepolia-contract:
	- rm -R ./ignition/deployments
	- npx hardhat compile
	- npx hardhat ignition deploy ./ignition/modules/${CONTRAC}.ts --network sepolia

# make verify ADDRESS=<contract-address>
verify: 
	- npx hardhat verify ${ADDRESS} ${ORACLE_ADDRESS} --network sepolia