import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('Block Number Bet', async () => {
	const runEveryTime = async () => {
		const BlockNumberBetContractFactory = await ethers.getContractFactory(
			'BlockNumberBet'
		);
		const blockNumberBetTransferContract =
			await BlockNumberBetContractFactory.deploy();
		await blockNumberBetTransferContract.deployed();

		const accounts = await ethers.getSigners();
		const provider = await ethers.provider;

		const balanceInHex = utils.hexStripZeros(
			utils.parseEther('5').toHexString()
		);

		await provider.send('hardhat_setBalance', [
			accounts[0].address,
			balanceInHex,
		]);

		return { blockNumberBetTransferContract, provider, accounts };
	};

	describe('INITIAL CONDITIONS', async () => {
		it('Contract should have zero balance', async () => {
			const { blockNumberBetTransferContract, provider } = await loadFixture(
				runEveryTime
			);
			const balance = await provider.getBalance(
				blockNumberBetTransferContract.address
			);
			expect(balance).to.be.equal(new (BigNumber as any).from(0));
		});
		it('The user[0] should have 5 ETH in balance', async () => {
			const { accounts, provider } = await loadFixture(runEveryTime);
			const balance = await provider.getBalance(accounts[0].address);
			expect(balance).to.be.equal(
				new (BigNumber as any).from(utils.parseEther('5'))
			);
		});
	});

	describe('Gamble on Tenth Block', async () => {
		it('Should Accept 1 Ether', async () => {
			const { blockNumberBetTransferContract, provider, accounts } =
				await loadFixture(runEveryTime);

			// MINING 1000 blocks
			await provider.send('hardhat_mine', [
				utils.hexStripZeros(utils.hexValue(1000)),
			]);

			const tx = await blockNumberBetTransferContract.gambleOnTenthBlockNumber({
				value: utils.parseEther('1'),
			});
			await tx.wait();

			const balance = await provider.getBalance(
				blockNumberBetTransferContract.address
			);
			expect(balance).to.be.equal(
				new (BigNumber as any).from(utils.parseEther('1'))
			);
		});
		it('Should Not Accept 1.1 Ether', async () => {
			const { blockNumberBetTransferContract, provider } = await loadFixture(
				runEveryTime
			);

			// MINING 1000 blocks
			await provider.send('hardhat_mine', [
				utils.hexStripZeros(utils.hexValue(1000)),
			]);

			await expect(
				blockNumberBetTransferContract.gambleOnTenthBlockNumber({
					value: utils.parseEther('1.1'),
				})
			).to.be.revertedWith('Not Degen Enough');
		});
		it('Should Not Be Able To Gamble (BEFORE COOL DOWN TIME) If A Bet Is Already Placed', async () => {
			const { blockNumberBetTransferContract, provider, accounts } =
				await loadFixture(runEveryTime);

			// MINING 1000 blocks
			await provider.send('hardhat_mine', [
				utils.hexStripZeros(utils.hexValue(1000)),
			]);

			const tx = await blockNumberBetTransferContract
				.connect(accounts[0])
				.gambleOnTenthBlockNumber({
					value: utils.parseEther('1'),
				});
			await tx.wait();

			await expect(
				blockNumberBetTransferContract
					.connect(accounts[0])
					.gambleOnTenthBlockNumber({
						value: utils.parseEther('1'),
					})
			).to.be.revertedWith('Wait for cooldown time');
		});
		it('Should Be Able To Gamble (AFTER COOL DOWN TIME) If A Bet Is Already Placed', async () => {
			const { blockNumberBetTransferContract, provider, accounts } =
				await loadFixture(runEveryTime);

			// MINING 1000 blocks
			await provider.send('hardhat_mine', [
				utils.hexStripZeros(utils.hexValue(1000)),
			]);

			const tx = await blockNumberBetTransferContract
				.connect(accounts[0])
				.gambleOnTenthBlockNumber({
					value: utils.parseEther('1'),
				});
			await tx.wait();

			await provider.send('hardhat_mine', [
				utils.hexStripZeros(utils.hexValue(1000)),
			]);

			const txAgain = await blockNumberBetTransferContract
				.connect(accounts[0])
				.gambleOnTenthBlockNumber({
					value: utils.parseEther('1'),
				});
			await txAgain.wait();

			const balance = await provider.getBalance(
				blockNumberBetTransferContract.address
			);
			expect(balance).to.be.equal(
				new (BigNumber as any).from(utils.parseEther('2'))
			);
		});
	});

	describe('Claim Winnings', async () => {
		it('Should Not Allow Claiming Before Time', async () => {
			const { blockNumberBetTransferContract, provider, accounts } =
				await loadFixture(runEveryTime);

			// MINING 1000 blocks
			await provider.send('hardhat_mine', [
				utils.hexStripZeros(utils.hexValue(1000)),
			]);

			const tx = await blockNumberBetTransferContract.gambleOnTenthBlockNumber({
				value: utils.parseEther('1'),
			});
			await tx.wait();

			await expect(
				blockNumberBetTransferContract.claimWinnings()
			).to.be.revertedWith('Too early !!');
		});

		it('Should Not Allow Claiming After MAX_BLOCK Time', async () => {
			const { blockNumberBetTransferContract, provider, accounts } =
				await loadFixture(runEveryTime);

			// MINING 1000 blocks
			await provider.send('hardhat_mine', [
				utils.hexStripZeros(utils.hexValue(1000)),
			]);

			const tx = await blockNumberBetTransferContract.gambleOnTenthBlockNumber({
				value: utils.parseEther('1'),
			});
			await tx.wait();

			await provider.send('hardhat_mine', [
				utils.hexStripZeros(utils.hexValue(1000)),
			]);

			await expect(
				blockNumberBetTransferContract.claimWinnings()
			).to.be.revertedWith('Too Late !!');
		});
	});

	runEveryTime();
});
