# make sepolia
sepolia:
	- rm -R ./ignition/deployments
	- npx hardhat compile
	- npx hardhat ignition deploy ./ignition/modules/Betting.ts --network sepolia

# make verify ADDRESS=<contract-address>
verify: 
	- npx hardhat verify ${ADDRESS} --network sepolia