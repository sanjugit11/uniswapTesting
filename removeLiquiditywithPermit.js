const {expect} = require("chai");
const { ethers } = require("hardhat");
// const {BN} = require('@openzeppelin/test-helpers');
const { ecsign } = require("ethereumjs-util");
const { default: Wallet } = require("ethereumjs-wallet");

const {contractFile} = require('../artifacts/contracts/FirstToken.sol/FirstToken.json');

describe("TEST WITH NON TAXABLE TOKEN", function() {
    
    beforeEach(async() => {

        // provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');

        // wallets = ethers.Wallet.createRandom();
        // signer = wallets.connect(provider);

        // signer = new ethers.utils.SigningKey();
        signers = await ethers.getSigners(1);
        signer = signers[0];
        
        // const contract = JSON.parse(contractFile.toString());
        // const factory = new ethers.ContractFactory(contract.abi, contract.bytecode, signer);
        // firsttoken = await factory.deploy(100000000000000000000n) 
            
        // factory = new ethers.ContractFactory(abi, bytecode, signer);
        // firsttoken = await factory.deploy(100000000000000000000n);

        UNISWAPV2FACTORY = await ethers.getContractFactory("UniswapV2Factory");
        uniswapv2factory = await UNISWAPV2FACTORY.deploy(signer.address);
     
        WETH9 = await ethers.getContractFactory("WETH9");
        weth9 = await WETH9.deploy();
    
        UNISWAPV2ROUTER02 = await ethers.getContractFactory("UniswapV2Router02");
        uniswapv2router02 = await UNISWAPV2ROUTER02.deploy(uniswapv2factory.address, weth9.address);
    
        FIRSTTOKEN = await ethers.getContractFactory("FirstToken", signer);
        firsttoken = await FIRSTTOKEN.deploy(100000000000000000000n);
        SECONDTOKEN = await ethers.getContractFactory("SecondToken");
        secondtoken = await SECONDTOKEN.deploy(100000000000000000000n);
        
    });

        it("addLiquidity TEST", async function () {
            
            GETINIT = await ethers.getContractFactory("CalHash");
            getinit = await GETINIT.deploy();
            // console.log(await getinit.getInitHash());

            // console.log(signer.address, signer.privateKey)

            await firsttoken.approve(uniswapv2router02.address, 10000000000000000000n);
            await secondtoken.approve(uniswapv2router02.address, 10000000000000000000n);

            await uniswapv2router02.addLiquidity(firsttoken.address, secondtoken.address, 4000000000000000000n, 2000000000000000000n, 4000000000000000000n, 2000000000000000000n, signer.address, 1698086504);
            
            getPairAddress = await uniswapv2factory.getPair(firsttoken.address, secondtoken.address);
            UNISWAPV2PAIR = await ethers.getContractFactory("UniswapV2Pair");
            uniswapv2pair = await UNISWAPV2PAIR.attach(getPairAddress);
            [reserve0, reserve1] = await uniswapv2pair.getReserves();

            expect(reserve0).to.equal(4000000000000000000n);
            expect(reserve1).to.equal(2000000000000000000n);
            expect(await firsttoken.balanceOf(signer.address)).to.equal(96000000000000000000n);
           
            
            
        });

        it("removeLiquidityWithPermit TEST", async function () {

            const deadLine = ethers.constants.MaxUint256;

            GETINIT = await ethers.getContractFactory("CalHash");
            getinit = await GETINIT.deploy();
            // console.log(await getinit.getInitHash());
            // console.log(signer.address, signer.privateKey, signer)

       
            // console.log(await firsttoken.balanceOf(signer.address))
       
            await firsttoken.approve(uniswapv2router02.address, 10000000000000000000n);

            // console.log(await firsttoken.allowance(signer.address, uniswapv2router02.address));

            await secondtoken.approve(uniswapv2router02.address, 10000000000000000000n);


            await uniswapv2router02.addLiquidity(firsttoken.address, secondtoken.address, 4000000000000000000n, 2000000000000000000n, 4000000000000000000n, 2000000000000000000n, signer.address, deadLine);
           
            getPairAddress = await uniswapv2factory.getPair(firsttoken.address, secondtoken.address);
            UNISWAPV2PAIR = await ethers.getContractFactory("UniswapV2Pair");
            uniswapv2pair = await UNISWAPV2PAIR.attach(getPairAddress);
            [reserve0, reserve1] = await uniswapv2pair.getReserves();
            liquidity = await uniswapv2pair.balanceOf(signer.address);

            bal = await firsttoken.balanceOf(signer.address)

            // console.log(reserve0, reserve1, bal, liquidity)
            
           
            // expect(await firsttoken.balanceOf(signer.address)).to.equal(96000000000000000000n);

           signature1 = await signer._signTypedData( 
               {
                name: await uniswapv2pair.name(),
                version: '1',
                chainId: 0,
                verifyingContract: uniswapv2pair.address,
              },
              {
                Permit: [
                  {
                    name: 'owner',
                    type: 'address',
                  },
                  {
                    name: 'spender',
                    type: 'address',
                  },
                  {
                    name: 'value',
                    type: 'uint256',
                  },
                  {
                    name: 'nonce',
                    type: 'uint256',
                  },
                  {
                    name: 'deadline',
                    type: 'uint256',
                  },
                ],
              },
              {
                owner: signer.address,
                spender: uniswapv2router02.address,
                value: liquidity,
                nonce: await uniswapv2pair.nonces(signer.address),
                deadline: deadLine,
              });

        //     const domain =  {
        //         name: 'Uniswap V2',
        //         version: '1',
        //         chainId: await signer.getChainId(),
        //         verifyingContract: uniswapv2pair.address,
        //     };
         

        //     const types = {
        //         Permit: [
        //         { name: 'owner', type: 'address' },
        //         { name: 'spender', type: 'address' },
        //         { name: 'value', type: 'uint256' },
        //         { name: 'nonce', type: 'uint256' },
        //         { name: 'deadline', type: 'uint256' }
        //         ]
        //     };
            
        //    const value = {
        //         owner: signer.address,
        //         spender: uniswapv2router02.address,
        //         value: liquidity,
        //         nonce: await uniswapv2pair.nonces(signer.address),
        //         deadline: deadLine,
        //     };

        //   console.log(value.nonce);

        //     signature2 = await signer._signTypedData(domain, types, value);


            const sig1 = await ethers.utils.splitSignature(signature1);
        //     const sig2 = await ethers.utils.splitSignature(signature2);
        
            // console.log(ethers.utils.hexlify(sig1.r), sig1.s, sig1.v);
        //     console.log(sig2.v, sig2.r, sig2.s);

        //     console.log(signer.address)

            


// const PERMIT_TYPEHASH = ethers.utils.keccak256(
//     ethers.utils.toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
//   );
// abiCoder = ethers.utils.defaultAbiCoder;
  
// async function getDomainSeparator(name, tokenAddress) {

//     return ethers.utils.keccak256(
//       abiCoder.encode(
//         ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
//         [
//             ethers.utils.keccak256( ethers.utils.toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')),
//             ethers.utils.keccak256( ethers.utils.toUtf8Bytes(name)),
//             ethers.utils.keccak256( ethers.utils.toUtf8Bytes('1')),
//           0,
//           tokenAddress
//         ]
//       )
//     )
//   }
  
//   async function getApprovalDigest(token, owner, spender, value, nonce, deadline) {

//     const name = await token.name();
//     const DOMAIN_SEPARATOR = await getDomainSeparator(name, token.address)

//     return ethers.utils.keccak256(
//       ethers.utils.solidityPack(
//         ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
//         [
//           '0x19',
//           '0x01',
//           DOMAIN_SEPARATOR,
//           ethers.utils.keccak256(
//             abiCoder.encode(
//               ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
//               [PERMIT_TYPEHASH, owner, spender, value, nonce, deadline]
//             )
//           )
//         ]
//       )
//     )
//   }

//   const digest = await getApprovalDigest(uniswapv2pair, signer.address, uniswapv2router02.address, liquidity, 0, deadLine);
// //   console.log(digest);

//   const { v, r, s } = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(signer.privateKey.slice(2), 'hex'));
// //   console.log(v,r,s, ethers.utils.hexlify(r), ethers.utils.hexlify(s));

//   await uniswapv2pair.permit(signer.address, uniswapv2router02.address, liquidity, deadLine, sig1.v, sig1.r, sig1.s);
//   console.log("DONE")

//   await uniswapv2router02.removeLiquidity(firsttoken.address, secondtoken.address, liquidity, 3800000000000000000n, 1800000000000000000n, signer.address, deadLine);
// console.log(await firsttoken.balanceOf(signer.address));

  await uniswapv2router02.removeLiquidityWithPermit(firsttoken.address, secondtoken.address, liquidity, 3800000000000000000n, 1800000000000000000n, signer.address, deadLine, false, sig1.v, sig1.r, sig1.s);
            [reserve0, reserve1] = await uniswapv2pair.getReserves();
            // console.log(reserve0, reserve1);
            // console.log(await firsttoken.balanceOf(signer.address));
        });



        it("addLiquidityETH TEST", async() => {

            const deadLine = ethers.constants.MaxUint256;

            await firsttoken.approve(uniswapv2router02.address, 10000000000000000000n);

            await uniswapv2router02.addLiquidityETH(firsttoken.address, 4000000000000000000n, 4000000000000000000n, 1000000000000000000n, signer.address, deadLine, { value: ethers.utils.parseEther("1") });
    
            getPairAddress = await uniswapv2factory.getPair(firsttoken.address, weth9.address);
            UNISWAPV2PAIR = await ethers.getContractFactory("UniswapV2Pair");
            uniswapv2pair = await UNISWAPV2PAIR.attach(getPairAddress);
            [reserve0, reserve1] = await uniswapv2pair.getReserves();

            expect(reserve1).to.equal(1000000000000000000n);
            expect(reserve0).to.equal(4000000000000000000n);
        });


        it("removeLiquidityETHWithPermit TEST", async function () {

            const deadLine = ethers.constants.MaxUint256;

            GETINIT = await ethers.getContractFactory("CalHash");
            getinit = await GETINIT.deploy();
            
       
            await firsttoken.approve(uniswapv2router02.address, 10000000000000000000n);

            await uniswapv2router02.addLiquidityETH(firsttoken.address, 4000000000000000000n, 4000000000000000000n, 1000000000000000000n, signer.address, deadLine, { value: ethers.utils.parseEther("1") });
            
           
            getPairAddress = await uniswapv2factory.getPair(firsttoken.address, weth9.address);
            UNISWAPV2PAIR = await ethers.getContractFactory("UniswapV2Pair");
            uniswapv2pair = await UNISWAPV2PAIR.attach(getPairAddress);
            [reserve0, reserve1] = await uniswapv2pair.getReserves();
            liquidity = await uniswapv2pair.balanceOf(signer.address);

               signature1 = await signer._signTypedData( 
               {
                name: await uniswapv2pair.name(),
                version: '1',
                chainId: 0,
                verifyingContract: uniswapv2pair.address,
              },
              {
                Permit: [
                  {
                    name: 'owner',
                    type: 'address',
                  },
                  {
                    name: 'spender',
                    type: 'address',
                  },
                  {
                    name: 'value',
                    type: 'uint256',
                  },
                  {
                    name: 'nonce',
                    type: 'uint256',
                  },
                  {
                    name: 'deadline',
                    type: 'uint256',
                  },
                ],
              },
              {
                owner: signer.address,
                spender: uniswapv2router02.address,
                value: liquidity,
                nonce: await uniswapv2pair.nonces(signer.address),
                deadline: deadLine,
              });

            const sig1 = await ethers.utils.splitSignature(signature1);

            console.log(reserve0, reserve1);
            await uniswapv2router02.removeLiquidityETHWithPermit(firsttoken.address, liquidity, 3800000000000000000n, 900000000000000000n, signer.address, deadLine, false, sig1.v, sig1.r, sig1.s);
            [reserve0, reserve1] = await uniswapv2pair.getReserves();
            console.log(reserve0, reserve1);
           
        });

        it("swapExactTokensForTokens TEST", async () => {
 
            await firsttoken.approve(uniswapv2router02.address, 10000000000000000000n);
            await secondtoken.approve(uniswapv2router02.address, 10000000000000000000n);

            await uniswapv2router02.addLiquidity(firsttoken.address, secondtoken.address, 4000000000000000000n, 2000000000000000000n, 4000000000000000000n, 2000000000000000000n, signer.address, 1698086504);
            getPairAddress = await uniswapv2factory.getPair(firsttoken.address, secondtoken.address);
            UNISWAPV2PAIR = await ethers.getContractFactory("UniswapV2Pair");
            uniswapv2pair = await UNISWAPV2PAIR.attach(getPairAddress);
            
            await uniswapv2router02.swapExactTokensForTokens(1000000000000000000n, 1000000000000000000n, [secondtoken.address,firsttoken.address], signer.address, 1698086504);
            [reserve0, reserve1] = await uniswapv2pair.getReserves();
            expect(reserve1).to.equal(3000000000000000000n);
        });

        it("swapTokensForExactTokens TEST", async () => {

            await firsttoken.approve(uniswapv2router02.address, 10000000000000000000n);
            await secondtoken.approve(uniswapv2router02.address, 10000000000000000000n);

            await uniswapv2router02.addLiquidity(firsttoken.address, secondtoken.address, 4000000000000000000n, 2000000000000000000n, 4000000000000000000n, 2000000000000000000n, signer.address, 1698086504);

            getPairAddress = await uniswapv2factory.getPair(firsttoken.address, secondtoken.address);
            UNISWAPV2PAIR = await ethers.getContractFactory("UniswapV2Pair");
            uniswapv2pair = await UNISWAPV2PAIR.attach(getPairAddress);
            [reserve0, reserve1] = await uniswapv2pair.getReserves();
            
            await uniswapv2router02.swapTokensForExactTokens(2000000000000000000n, 2100000000000000000n, [secondtoken.address,firsttoken.address], signer.address, 1698086504);            
            expect(await firsttoken.balanceOf(signer.address)).to.equal(98000000000000000000n);
            [reserve0, reserve1] = await uniswapv2pair.getReserves();
            expect(reserve0).to.equal(2000000000000000000n);
        });

        it("swapExactETHForTokens TEST", async() => {

            await firsttoken.approve(uniswapv2router02.address, 10000000000000000000n);

            await uniswapv2router02.addLiquidityETH(firsttoken.address, 4000000000000000000n, 4000000000000000000n, 1000000000000000000n, signer.address, 1698086504, { value: ethers.utils.parseEther("1") });
    
            getPairAddress = await uniswapv2factory.getPair(firsttoken.address, weth9.address);
            UNISWAPV2PAIR = await ethers.getContractFactory("UniswapV2Pair");
            uniswapv2pair = await UNISWAPV2PAIR.attach(getPairAddress);

            await uniswapv2router02.swapExactETHForTokens(1900000000000000000n, [weth9.address,firsttoken.address], signer.address, 1698086504, { value: ethers.utils.parseEther("1") });
            [reserve0, reserve1] = await uniswapv2pair.getReserves();
            expect(reserve1).to.equal(2000000000000000000n);
           
        });

        it.only("swapTokensForExactETH TEST", async() => {

            await firsttoken.approve(uniswapv2router02.address, 10000000000000000000n);

            await uniswapv2router02.addLiquidityETH(firsttoken.address, 4000000000000000000n, 4000000000000000000n, 1000000000000000000n, signer.address, 1698086504, { value: ethers.utils.parseEther("1") });
    
            getPairAddress = await uniswapv2factory.getPair(firsttoken.address, weth9.address);

            UNISWAPV2PAIR = await ethers.getContractFactory("UniswapV2Pair");
            uniswapv2pair = await UNISWAPV2PAIR.attach(getPairAddress);

            await uniswapv2router02.swapTokensForExactETH(500000000000000000n, 4100000000000000000n, [firsttoken.address,weth9.address], signer.address, 1698086504);
            [reserve0, reserve1] = await uniswapv2pair.getReserves();
            expect(reserve0).to.equal(8012036108324974925n);
           
        });

        it("swapExactTokensForETH TEST", async() => {

            await firsttoken.approve(uniswapv2router02.address, 10000000000000000000n);

            await uniswapv2router02.addLiquidityETH(firsttoken.address, 2000000000000000000n, 2000000000000000000n, 1000000000000000000n, signer.address, 1698086504, { value: ethers.utils.parseEther("1") });
    
            getPairAddress = await uniswapv2factory.getPair(firsttoken.address, weth9.address);
            UNISWAPV2PAIR = await ethers.getContractFactory("UniswapV2Pair");
            uniswapv2pair = await UNISWAPV2PAIR.attach(getPairAddress);

            await uniswapv2router02.swapExactTokensForETH(2000000000000000000n, 400000000000000000n, [firsttoken.address,weth9.address], signer.address, 1698086504);
            [reserve0, reserve1] = await uniswapv2pair.getReserves();
            expect(reserve1).to.equal(4000000000000000000n);
           
        });

        it("swapETHForExactTokens TEST", async() => {

            await firsttoken.approve(uniswapv2router02.address, 10000000000000000000n);

            await uniswapv2router02.addLiquidityETH(firsttoken.address, 4000000000000000000n, 4000000000000000000n, 1000000000000000000n, signer.address, 1698086504, { value: ethers.utils.parseEther("1") });
    
            getPairAddress = await uniswapv2factory.getPair(firsttoken.address, weth9.address);
            UNISWAPV2PAIR = await ethers.getContractFactory("UniswapV2Pair");
            uniswapv2pair = await UNISWAPV2PAIR.attach(getPairAddress);

            await uniswapv2router02.swapETHForExactTokens(2000000000000000000n, [weth9.address,firsttoken.address], signer.address, 1698086504, { value: ethers.utils.parseEther("1.1") });
            [reserve0, reserve1] = await uniswapv2pair.getReserves();
            expect(reserve0).to.equal(2000000000000000000n);
           
        });

        
    });

describe("TEST WITH TAXABLE TOKEN", function() {

        beforeEach(async() => {

            signers = await ethers.getSigners();
            owner = signers[0];
        
            UNISWAPV2FACTORY = await ethers.getContractFactory("UniswapV2Factory");
            uniswapv2factory = await UNISWAPV2FACTORY.deploy(owner.address);
         
            WETH9 = await ethers.getContractFactory("WETH9");
            weth9 = await WETH9.deploy();
            
            UNISWAPV2ROUTER02 = await ethers.getContractFactory("UniswapV2Router02");
            uniswapv2router02 = await UNISWAPV2ROUTER02.deploy(uniswapv2factory.address, weth9.address);
            
            FIRSTTAXTOKEN = await ethers.getContractFactory("FirstTaxToken");
            firsttaxtoken = await FIRSTTAXTOKEN.deploy();
            
            SECONDTAXTOKEN = await ethers.getContractFactory("SecondTaxToken");
            secondtaxtoken = await SECONDTAXTOKEN.deploy();    
            
    });

    it("addLiquidityETH TEST", async() => {

        await firsttaxtoken.approve(uniswapv2router02.address, 10000000000000000000n);

        await uniswapv2router02.addLiquidityETH(firsttaxtoken.address, 4000000000000000000n, 4000000000000000000n, 1000000000000000000n, owner.address, 1698086504, { value: ethers.utils.parseEther("1") });

        getPairAddress = await uniswapv2factory.getPair(firsttaxtoken.address, weth9.address);
        UNISWAPV2PAIR = await ethers.getContractFactory("UniswapV2Pair");
        uniswapv2pair = await UNISWAPV2PAIR.attach(getPairAddress);
        [reserve0, reserve1] = await uniswapv2pair.getReserves();

        expect(reserve1).to.equal(1000000000000000000n);
        expect(reserve0).to.equal(3800000000000000000n);
    });

    it("swapExactTokensForTokensSupportingFeeOnTransferTokens TEST", async () => {

        await firsttaxtoken.approve(uniswapv2router02.address, 10000000000000000000n);
        await secondtaxtoken.approve(uniswapv2router02.address, 10000000000000000000n);

        await uniswapv2router02.addLiquidity(firsttaxtoken.address, secondtaxtoken.address, 4000000000000000000n, 2000000000000000000n, 4000000000000000000n, 2000000000000000000n, owner.address, 1698086504);
        getPairAddress = await uniswapv2factory.getPair(firsttaxtoken.address, secondtaxtoken.address);

        UNISWAPV2PAIR = await ethers.getContractFactory("UniswapV2Pair");
        uniswapv2pair = await UNISWAPV2PAIR.attach(getPairAddress);
        
        await uniswapv2router02.swapExactTokensForTokensSupportingFeeOnTransferTokens(2000000000000000000n, 1700000000000000000n, [secondtaxtoken.address,firsttaxtoken.address], owner.address, 1698086504);
        expect(await firsttaxtoken.balanceOf(owner.address)).to.equal(97802288432648973460n);
        [reserve0, reserve1] = await uniswapv2pair.getReserves();
        expect(reserve1).to.equal(3800000000000000000n);
        
    });

    it("swapExactETHForTokensSupportingFeeOnTransferTokens TEST", async () => {

        await firsttaxtoken.approve(uniswapv2router02.address, 10000000000000000000n);

        await uniswapv2router02.addLiquidityETH(firsttaxtoken.address, 4000000000000000000n, 4000000000000000000n, 1000000000000000000n, owner.address, 1698086504, { value: ethers.utils.parseEther("1") });

        getPairAddress = await uniswapv2factory.getPair(firsttaxtoken.address, weth9.address);

        UNISWAPV2PAIR = await ethers.getContractFactory("UniswapV2Pair");
        uniswapv2pair = await UNISWAPV2PAIR.attach(getPairAddress);
        
        await uniswapv2router02.swapExactETHForTokensSupportingFeeOnTransferTokens(1800000000000000000n, [weth9.address,firsttaxtoken.address], owner.address, 1698086504, { value: ethers.utils.parseEther("1") });
        // expect(await firsttaxtoken.balanceOf(owner.address)).to.equal(97802288432648973460n);
        [reserve0, reserve1] = await uniswapv2pair.getReserves();
        expect(reserve0).to.equal(2000000000000000000n);
        
    });

    it("swapExactTokensForETHSupportingFeeOnTransferTokens TEST", async () => {

        await firsttaxtoken.approve(uniswapv2router02.address, 10000000000000000000n);

        await uniswapv2router02.addLiquidityETH(firsttaxtoken.address, 4000000000000000000n, 4000000000000000000n, 1000000000000000000n, owner.address, 1698086504, { value: ethers.utils.parseEther("1") });

        getPairAddress = await uniswapv2factory.getPair(firsttaxtoken.address, weth9.address);

        UNISWAPV2PAIR = await ethers.getContractFactory("UniswapV2Pair");
        uniswapv2pair = await UNISWAPV2PAIR.attach(getPairAddress);
        
        await uniswapv2router02.swapExactTokensForETHSupportingFeeOnTransferTokens(4000000000000000000n, 450000000000000000n, [firsttaxtoken.address,weth9.address], owner.address, 1698086504);
        [reserve0, reserve1] = await uniswapv2pair.getReserves();
        expect(reserve1).to.equal(500751126690035053n);
        
    });
});
