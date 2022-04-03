const { expect } = require('chai');
const { ethers } = require('hardhat');
const { parseUnits, formatUnits } = ethers.utils;
const { CHAILINK_PRICE_ORACLE_ADDRESS_USD, ERC20_TOKEN_ADDRESS } = require('../../constant');
const CustomerToken = require('../../artifacts/contracts/CustomerToken.sol/CustomerToken.json');
const sandABI = require('../../abi/SAND.json');

describe('Qoistip', function () {
  let qoistip;
  let qoistipPriceAggregator;
  let customerToken1;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  before(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const QoistipPriceAggregator = await ethers.getContractFactory('QoistipPriceAggregator');
    qoistipPriceAggregator = await QoistipPriceAggregator.deploy();

    const Qoistip = await ethers.getContractFactory('Qoistip');
    qoistip = await Qoistip.deploy(9700, qoistipPriceAggregator.address);
  });

  describe('Set new price token oracle', () => {
    it('Check if not suported, no price oracle', async function () {
      const priceOracleData = await qoistip.priceOracle(ERC20_TOKEN_ADDRESS.SAND);
      expect(priceOracleData.oracleAddress).to.equal('0x0000000000000000000000000000000000000000');
      expect(priceOracleData.priceInUSD).to.equal(false);
      expect(priceOracleData.isChailink).to.equal(false);
    });
    it('Add price token pracle and check if data on-chain are right', async function () {
      await qoistip.setPriceOracle(ERC20_TOKEN_ADDRESS.SAND, CHAILINK_PRICE_ORACLE_ADDRESS_USD.SAND, true, true);

      const priceOracleData = await qoistip.priceOracle(ERC20_TOKEN_ADDRESS.SAND);
      expect(priceOracleData.oracleAddress).to.equal(CHAILINK_PRICE_ORACLE_ADDRESS_USD.SAND);
      expect(priceOracleData.priceInUSD).to.equal(true);
      expect(priceOracleData.isChailink).to.equal(true);
    });
    it('Only owner can set price token oracle', async function () {
      await expect(
        qoistip.connect(addr1).setPriceOracle(ERC20_TOKEN_ADDRESS.ENJ, CHAILINK_PRICE_ORACLE_ADDRESS_USD.ENJ, true, true),
      ).to.be.revertedWith('Ownable: caller is not the owner');

      await qoistip.setPriceOracle(ERC20_TOKEN_ADDRESS.ENJ, CHAILINK_PRICE_ORACLE_ADDRESS_USD.ENJ, true, true);

      const priceOracleData = await qoistip.priceOracle(ERC20_TOKEN_ADDRESS.ENJ);
      expect(priceOracleData.oracleAddress).to.equal(CHAILINK_PRICE_ORACLE_ADDRESS_USD.ENJ);
      expect(priceOracleData.priceInUSD).to.equal(true);
      expect(priceOracleData.isChailink).to.equal(true);
    });
    it('Disabled ptice token oracle', async function () {
      await qoistip.setPriceOracle(ERC20_TOKEN_ADDRESS.ENJ, '0x0000000000000000000000000000000000000000', false, false);

      const priceOracleData = await qoistip.priceOracle(ERC20_TOKEN_ADDRESS.ENJ);
      expect(priceOracleData.oracleAddress).to.equal('0x0000000000000000000000000000000000000000');
      expect(priceOracleData.priceInUSD).to.equal(false);
      expect(priceOracleData.isChailink).to.equal(false);
    });
  });

  describe('New customer', async () => {
    it('Register new customer and emit event NewCustomer', async () => {
      const registerCustomerTransation = await qoistip
        .connect(addr1)
        .registerCustomer('CT1', 'CustomerToken1');

      registerCustomerTransation.wait();
      const customerToken1Address = await qoistip.tokenCustomer(addr1.address);

      await expect(registerCustomerTransation).to.emit(qoistip, 'NewCustomer').withArgs(addr1.address, customerToken1Address);
      expect(customerToken1Address).to.not.equal('0x0000000000000000000000000000000000000000');

      customerToken1 = new ethers.Contract(customerToken1Address, CustomerToken.abi, ethers.provider);
      expect(await customerToken1.name()).to.equal('CustomerToken1');
      expect(await customerToken1.symbol()).to.equal('CT1');
      expect(await customerToken1.totalSupply()).to.equal(0);
      // expect(await customerToken1.maxSupply()).to.equal(parseUnits('1000000'));
      expect(await customerToken1.owner()).to.equal(qoistip.address);
    });
  });
});