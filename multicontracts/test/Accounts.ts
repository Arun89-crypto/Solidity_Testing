import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('Accounts', async () => {
	const DEPLOYER_ID = 3;
	const ATTACKER_ID = 5;
	const NEW_ADMIN = 4;

	const runEveryTime = async () => {
		const accounts = await ethers.getSigners();
		const AccountsContractFactory = await ethers.getContractFactory('Accounts');
		const accountsContract = await AccountsContractFactory.connect(
			accounts[DEPLOYER_ID]
		).deploy();

		return { accountsContract, accounts };
	};

	describe('Admin', async () => {
		it('Should be the accounts[DEPLOYER_ID] address', async () => {
			const { accountsContract, accounts } = await loadFixture(runEveryTime);
			// console.log(accounts[DEPLOYER_ID].address);
			expect(await accountsContract.admin()).to.be.equal(
				accounts[DEPLOYER_ID].address
			);
		});
	});

	describe('Admin Change', async () => {
		context('Rejecting the sender', async () => {
			it('Attacker should not be allowed to change', async () => {
				const { accountsContract, accounts } = await loadFixture(runEveryTime);
				await expect(
					accountsContract
						.connect(accounts[ATTACKER_ID])
						.changeAdmin(accounts[ATTACKER_ID].address)
				).to.be.revertedWith('Only Admin Operation');
			});
		});

		context('Accepting the sender', async () => {
			it('Should accept the sender', async () => {
				const { accountsContract, accounts } = await loadFixture(runEveryTime);
				await expect(
					accountsContract
						.connect(accounts[DEPLOYER_ID])
						.changeAdmin(accounts[NEW_ADMIN].address)
				).to.not.be.reverted;

				expect(await accountsContract.admin()).to.be.equal(
					accounts[NEW_ADMIN].address
				);
			});
		});
	});

	runEveryTime();
});
