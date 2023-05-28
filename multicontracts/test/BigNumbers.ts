import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('BigNumbers', async () => {
	const runEveryTime = async () => {
		const BigNumberContractFactory = await ethers.getContractFactory(
			'BigNumbers'
		);
		const bigNumberContract = await BigNumberContractFactory.deploy();

		return { bigNumberContract };
	};

	describe('getNumber', async () => {
		it('Should return 0 as the number initially', async () => {
			const { bigNumberContract } = await loadFixture(runEveryTime);
			expect(await bigNumberContract.getNumber()).to.be.equal(0);
		});
	});

	describe('setToMax', async () => {
		it('Should set the number to the max', async () => {
			const { bigNumberContract } = await loadFixture(runEveryTime);
			const tx = await bigNumberContract.setToMax();
			await tx.wait();

			expect(await bigNumberContract.getNumber()).to.be.equal(
				new (BigNumber as any).from(
					'115792089237316195423570985008687907853269984665640564039457584007913129639935'
				)
			);
		});
	});

	runEveryTime();
});
