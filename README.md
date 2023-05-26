# Solidity Testing

```shell
yarn hardhat help
yarn hardhat test
REPORT_GAS=true yarn hardhat test
yarn hardhat node
yarn hardhat run scripts/deploy.ts
```


## Test Results

```sh
yarn hardhat node
yarn hardhat test

------------------------------------------------------------------

MyTest
  Deployment
    ✓ Should check the unlockedTime
    ✓ Should check the owner of the contract
    ✓ Should be able to recieve the funds ot MyTest contract
    ✓ Should fail if the unlock timestamp is not in the future
  Withdrawls
    Validations
      ✓ Should revert with the right if called too soon
      ✓ Should revert the message for wrong owner
      ✓ Should not revert with correct time and owner
  EVENTS
    ✓ Should emit the withdraw event
  TRANSFER
    ✓ Should transfer the funds to owner

9 passing (663ms)

✨  Done in 7.52s.
```
