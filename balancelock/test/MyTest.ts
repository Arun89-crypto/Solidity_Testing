import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyTest", function() {
  async function runEveryTime() {
    const ONE_YEAR_IN_SECONDS = 356 * 24 * 60 * 60;
    const ONE_GWEI = 1000000000;
    const lockedAmount = ONE_GWEI;
    const unlockedTime = await time.latest() + ONE_YEAR_IN_SECONDS;

    const [owner, otherAccount] = await ethers.getSigners();

    const MyTest = await ethers.getContractFactory("MyTest");
    const myTest = await MyTest.deploy(unlockedTime, { value: lockedAmount });

    return { myTest, unlockedTime, lockedAmount, owner, otherAccount };
  }

  describe("Deployment", function() {
    // Should check the unlockedTime
    it("Should check the unlockedTime", async function() {
      const { myTest, unlockedTime } = await loadFixture(runEveryTime);
      expect(await myTest.unlockedTime()).to.equal(unlockedTime);
    });
    // Should check the owner of the contract
    it("Should check the owner of the contract", async function() {
      const { owner, myTest } = await loadFixture(runEveryTime);
      expect(await myTest.owner()).to.equal(owner.address);
    });
    // Checking the balance of the contract
    it("Should be able to recieve the funds ot MyTest contract", async function() {
      const { myTest, lockedAmount } = await loadFixture(runEveryTime);
      const contractBalance = await ethers.provider.getBalance(myTest.address);
      expect(contractBalance.toNumber()).to.equal(lockedAmount);
    });
    // If timestamp is not in future it should fail
    it("Should fail if the unlock timestamp is not in the future", async function() {
      const latestTime = await time.latest();
      const MyTest = await ethers.getContractFactory("MyTest");
      await expect(MyTest.deploy(latestTime, { value: 1 })).to.be.revertedWith("Time Stamp should be in future");
    });
  });

  describe("Withdrawls", async function() {
    describe("Validations", async function() {
      // Revert with the right if called too soon
      it("Should revert with the right if called too soon", async function() {
        const { myTest } = await loadFixture(runEveryTime);
        await expect(myTest.withdraw()).to.be.revertedWith("You need to wait !!");
      });
      // Revert the message for wrong owner
      it("Should revert the message for wrong owner", async function() {
        const { myTest, unlockedTime, otherAccount } = await loadFixture(runEveryTime);
        await time.increaseTo(unlockedTime);
        await expect(myTest.connect(otherAccount).withdraw()).to.be.revertedWith("You are not the owner");
      });
      // Should not revert with correct params
      it("Should not revert with correct time and owner", async function() {
        const { myTest, unlockedTime } = await loadFixture(runEveryTime);
        await time.increaseTo(unlockedTime);
        await expect(myTest.withdraw()).not.to.be.reverted;
      })
    });
  });

  describe("EVENTS", async function() {
    // Should emit the withdraw event
    it("Should emit the withdraw event", async function() {
      const { myTest, unlockedTime, lockedAmount } = await loadFixture(runEveryTime);
      await time.increaseTo(unlockedTime);
      await expect(myTest.withdraw()).to.emit(myTest, "Withdrawal").withArgs(lockedAmount, anyValue);
    });
  });

  describe("TRANSFER", async function() {
    // Should emit the withdraw event
    it("Should transfer the funds to owner", async function() {
      const { myTest, unlockedTime, lockedAmount, owner } = await loadFixture(runEveryTime);
      await time.increaseTo(unlockedTime);
      await expect(myTest.withdraw()).to.changeEtherBalances(
        [owner, myTest],
        [lockedAmount, -lockedAmount]
      );
    });
  });

  runEveryTime();
});
