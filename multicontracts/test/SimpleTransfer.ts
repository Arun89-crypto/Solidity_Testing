import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('Simple Transfer', async () => {
	const runEveryTime = async () => {
		const SimpleTransferContractFactory = await ethers.getContractFactory(
			'SimpleTransfer'
		);
		const simpleTransferContract = await SimpleTransferContractFactory.deploy();
		await simpleTransferContract.deployed();

		const accounts = await ethers.getSigners();
		const provider = await ethers.provider;

		const balanceInHex = utils.hexStripZeros(
			utils.parseEther('20000').toHexString()
		);

		await provider.send('hardhat_setBalance', [
			accounts[0].address,
			balanceInHex,
		]);

		return { simpleTransferContract, provider, accounts };
	};

	describe('INITIAL CONDITIONS', async () => {
		it('Contract should have zero balance', async () => {
			const { simpleTransferContract, provider } = await loadFixture(
				runEveryTime
			);
			const balance = await provider.getBalance(simpleTransferContract.address);
			expect(balance).to.be.equal(new (BigNumber as any).from(0));
		});
		it('The user[0] should have 20,000 ETH in balance', async () => {
			const { accounts, provider } = await loadFixture(runEveryTime);
			const balance = await provider.getBalance(accounts[0].address);
			expect(balance).to.be.equal(
				new (BigNumber as any).from(utils.parseEther('20000'))
			);
		});
	});

	describe('DEPOSIT', async () => {
		it('Should deposit 10,000 ETH into the contract', async () => {
			const { accounts, provider, simpleTransferContract } = await loadFixture(
				runEveryTime
			);

			const tx = await simpleTransferContract
				.connect(accounts[0])
				.deposit({ value: utils.parseEther('10000') });

			await tx.wait();

			expect(
				await provider.getBalance(simpleTransferContract.address)
			).to.be.equal(new (BigNumber as any).from(utils.parseEther('10000')));

			expect(await provider.getBalance(accounts[0].address)).to.be.closeTo(
				new (BigNumber as any).from(utils.parseEther('10000')),
				new (BigNumber as any).from(utils.parseEther('0.001')) // FAULT TOLERANCE (FOR GAS FEE ERRORS during test)
			);
		});
	});

	describe('WITHDRAW', async () => {
		it('Should withdraw 10,000 ETH into the account', async () => {
			const { accounts, provider, simpleTransferContract } = await loadFixture(
				runEveryTime
			);

			const tx = await simpleTransferContract
				.connect(accounts[0])
				.deposit({ value: utils.parseEther('10000') });

			await tx.wait();

			const txWithdraw = await simpleTransferContract
				.connect(accounts[0])
				.withdraw();

			await txWithdraw.wait();

			expect(
				await provider.getBalance(simpleTransferContract.address)
			).to.be.equal(new (BigNumber as any).from(0));

			expect(await provider.getBalance(accounts[0].address)).to.be.closeTo(
				new (BigNumber as any).from(utils.parseEther('20000')),
				new (BigNumber as any).from(utils.parseEther('0.001')) // FAULT TOLERANCE (FOR GAS FEE ERRORS during test)
			);
		});
	});

	runEveryTime();
});
