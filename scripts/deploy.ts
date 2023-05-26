import hre from "hardhat";

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECONDS;

  const lockedAmount = hre.ethers.utils.parseEther("1");

  console.log(lockedAmount);

  const MyTest = await hre.ethers.getContractFactory("MyTest");
  const myTest = await MyTest.deploy(unlockTime, { value: lockedAmount });
  await myTest.deployed();

  console.log(`Contract is deployed on address : ${myTest.address}`);
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
})


// 0x5FbDB2315678afecb367f032d93F642f64180aa3
