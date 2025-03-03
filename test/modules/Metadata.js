const { createDeployer } = require("../helpers/setup");
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

describe("Metadata", function() {
  let wallets = {
    numerai: accounts[0],
    seller: accounts[1],
    buyer: accounts[2]
  };

  let contracts = {
    TestMetadata: {
      artifact: require("../../build/TestMetadata.json")
    }
  };

  let deployer;

  before(() => {
    deployer = createDeployer();
  });

  beforeEach(async () => {
    contracts.TestMetadata.instance = await deployer.deploy(
      contracts.TestMetadata.artifact
    );
  });

  describe("Metadata._setStaticMetadata", () => {
    it("should not change static metadata", async () => {
      const metadata = "TESTING";
      await contracts.TestMetadata.instance.setStaticMetadata(
        Buffer.from(metadata)
      );

      await assert.revertWith(
        contracts.TestMetadata.instance.setStaticMetadata(
          Buffer.from(metadata)
        ),
        "static metadata cannot be changed"
      );
    });

    it("sets static metadata correctly", async () => {
      const metadata = "TESTING";
      const hexMetadata = web3.utils.utf8ToHex(metadata);
      const txn = await contracts.TestMetadata.instance.setStaticMetadata(
        Buffer.from(metadata)
      );
      assert.emit(txn, "StaticMetadataSet");
      assert.emitWithArgs(txn, [hexMetadata]);

      const [
        staticMetadata,
        variableMetadata
      ] = await contracts.TestMetadata.instance.getMetadata();
      assert.equal(staticMetadata, hexMetadata);
      assert.equal(variableMetadata, "0x"); // should be empty hex
    });
  });

  describe("Metadata._setVariableMetadata", () => {
    it("sets variable metadata correctly", async () => {
      const metadata = "TESTING";
      const hexMetadata = web3.utils.utf8ToHex(metadata);
      const txn = await contracts.TestMetadata.instance.setVariableMetadata(
        Buffer.from(metadata)
      );
      assert.emit(txn, "VariableMetadataSet");
      assert.emitWithArgs(txn, [hexMetadata]);

      const [
        staticMetadata,
        variableMetadata
      ] = await contracts.TestMetadata.instance.getMetadata();
      assert.equal(staticMetadata, "0x");
      assert.equal(variableMetadata, hexMetadata); // should be empty hex
    });
  });
});
