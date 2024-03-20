task('request', 'Makes a request').setAction(async () => {
    console.log('Requesting...');
    console.log(ethers);
    // call betting contract - request with 0.0001 ETH
    const contract = await ethers.getContract('Betting');
    const tx = await contract.request({ value: ethers.utils.parseEther('0.0001') });
    await tx.wait();
});
