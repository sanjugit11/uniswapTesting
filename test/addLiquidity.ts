import { expect } from "chai";
import { ethers } from "hardhat";
import {
    UniswapV2Router02,
    UniswapV2Factory,
    UniswapV2Factory__factory,
    UniswapV2Pair__factory,
    UniswapV2Router02__factory,
    ERC20,
    ERC20__factory,
    WETH9,
    WETH9__factory

} from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address"
import { expandTo18Decimals } from "../test/utilities/utilities";

describe("Add Liquiduty", function () {
    let router: UniswapV2Router02;
    let factory: UniswapV2Factory;
    let WETH: WETH9;
    let owner: SignerWithAddress;
    let signers: SignerWithAddress[];
    let s1 :SignerWithAddress;
    
    //let out;
    //let liquidity;

    beforeEach(async function () {
        signers = await ethers.getSigners();
        owner = signers[0];
        s1 = signers[1];
        factory = await new UniswapV2Factory__factory(owner).deploy(owner.address);
        WETH = await new WETH9__factory(owner).deploy();

        router = await new UniswapV2Router02__factory(owner).deploy(factory.address, WETH.address);
        // const Router2 = await ethers.getContractFactory("UniswapV2Router02");
        // router = await Router2.deploy("0x8cdFcF107492a7fC6c4Ace58a6E71322D123aDB4","0xc778417E063141139Fce010982780140Aa0cD5Ab");

    })

    describe(" Now Add liquidity", async function () {
        // await router.deployed();

        it("this is the call of add liquidity ETH --1", async () => {
            let token1 = await new ERC20__factory(owner).deploy(expandTo18Decimals(10000));

            await token1.approve(router.address, expandTo18Decimals(10000));
             
            await router.connect(owner).addLiquidityETH(token1.address, expandTo18Decimals(10000), expandTo18Decimals(1),
                expandTo18Decimals(1), owner.address, 1678948210, { value: 1 });
            // console.log(lol);

            const pair = await factory.getPair(token1.address, WETH.address);
            // console.log(pair);

            const Pair_instance = await new UniswapV2Pair__factory(owner).attach(pair);
            let result = await Pair_instance.getReserves();
            // console.log(result, "this is pair instance");

            let Reserve0 = Number(result._reserve0);
            let Reserve1 = Number(result._reserve1);
            expect(Reserve0).to.be.lessThanOrEqual(Number(expandTo18Decimals(10000)));
            expect(Reserve1).to.be.lessThanOrEqual(Number(expandTo18Decimals(1)));
        })
        //this is add liquidity token
        it("add liquidity tokenA & tokenB ---2", async function () {
            const token1 = await new ERC20__factory(owner).deploy(expandTo18Decimals(9999));
            const token2 = await new ERC20__factory(owner).deploy(expandTo18Decimals(8888));

            await token1.approve(router.address, expandTo18Decimals(9999));
            await token2.approve(router.address, expandTo18Decimals(8888));

            await router.connect(owner).addLiquidity(token1.address,token2.address,expandTo18Decimals(7777), expandTo18Decimals(8888)
                , expandTo18Decimals(1), expandTo18Decimals(1), owner.address, 1678948210);

            const pair = await factory.getPair(token1.address, token2.address);
            // console.log(pair , "for add liquidity");

            const Pair_instance = await new UniswapV2Pair__factory(owner).attach(pair);
            let result = await Pair_instance.getReserves();
            // console.log(result, "this is pair instance");

            let Reserve0 = Number(result._reserve0);
            let Reserve1 = Number(result._reserve1);
            expect(Reserve0).to.be.lessThanOrEqual(Number(expandTo18Decimals(8888)));
            expect(Reserve1).to.be.lessThanOrEqual(Number(expandTo18Decimals(7777)));
        })

        it("add Liquidity reverts if the amount is greater than the actual available number of tokens ----3 ", async function() {
            let token1  =  await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));
            let token2  =  await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));

            await token1.connect(owner).transfer(s1.address,expandTo18Decimals(10));
            await token1.connect(s1).approve(router.address,expandTo18Decimals(1000));
            await token2.connect(owner).transfer(s1.address,expandTo18Decimals(10));
            await token2.connect(s1).approve(router.address,expandTo18Decimals(1000));
            await expect(router.connect(s1).addLiquidity(token1.address, token2.address,
              expandTo18Decimals(20),expandTo18Decimals(20),
              expandTo18Decimals(1),expandTo18Decimals(1),s1.address,1678948210)).revertedWith("transferFrom: transferFrom failed");
          })

          it("AddLiquidityETH transfer fails ----4",async function(){
            let token1  =  await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));
            await token1.connect(owner).transfer(s1.address,expandTo18Decimals(10));
            await token1.connect(s1).approve(router.address,expandTo18Decimals(1000));
            await expect(router.connect(owner).addLiquidityETH(token1.address,
              expandTo18Decimals(10),
              expandTo18Decimals(1),expandTo18Decimals(1),owner.address,1678948210,{value : "125"})).revertedWith("transferFrom: transferFrom failed");
          })       

     //////////////////////swapTokensForExactTokens/////////////////////////////////////

          it("swapTokensForExactTokens",async function(){
            let token1  =  await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));
            let token2  =  await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));
            let array = [token1.address,token2.address];
            await token1.approve(router.address,expandTo18Decimals(1000));
            await token2.approve(router.address,expandTo18Decimals(1000));
        
            
            await router.connect(owner).addLiquidity(token1.address, token2.address,
              expandTo18Decimals(100),expandTo18Decimals(100),
              expandTo18Decimals(1),expandTo18Decimals(1),owner.address,1678948210);
        
              const Pair = await factory.getPair(token1.address, token2.address);
            
            const Pair_instance = await new UniswapV2Pair__factory(owner).attach(Pair);
              
              let result = await Pair_instance.getReserves();
              let Reserve0= Number(result._reserve0);
            //   console.log(Reserve0,"reserve 0 console");
              let Reserve1= Number(result._reserve1);
            //   console.log(Reserve1 ,"reserve1 console");

             await router.connect(owner).swapTokensForExactTokens(expandTo18Decimals(5),expandTo18Decimals(6),array,owner.address,1678948210);
             //here the (the out put amount , the max amount of token so the transaction can not revert ) // for above
             let result1 = await Pair_instance.getReserves();
            //  console.log(result1,"result 1 console");

             
             let Reserve2= Number(result1._reserve0);
            //  console.log(Reserve2,"reserve 2 console");
             Reserve0= Number(result1._reserve1);
            //  console.log(Reserve0,"reserve 0 console");

             expect(Reserve2).to.be.greaterThanOrEqual(Reserve0);
        
          })

     ////////////////////swapExactTokensForTokens/////////////////////////////////////

        it("swapExactTokensForTokens",async function(){
            let token1  =  await new ERC20__factory(owner).deploy(expandTo18Decimals(10000));
            let token2  =  await new ERC20__factory(owner).deploy(expandTo18Decimals(10000));
            let array = [token1.address, token2.address];
            await token1.approve(router.address,expandTo18Decimals(10000));
            await token2.approve(router.address,expandTo18Decimals(10000));

            await router.connect(owner).addLiquidity(token1.address, token2.address,
              expandTo18Decimals(1000),expandTo18Decimals(1000),
              expandTo18Decimals(1),expandTo18Decimals(1),owner.address,1678948210);
        
            const Pair = await factory.getPair(token1.address, token2.address);
            // const lpTokens = Pair.
            
            const Pair_instance = await new UniswapV2Pair__factory(owner).attach(Pair);
            // const lpTokens2 =  await Pair_instance.balanceOf(owner.address);
            // console.log(lpTokens2 ,"lp tokens for  swap tokend for ");

              let result = await Pair_instance.getReserves();
              let Reserve0= Number(result._reserve0);
            //   console.log(Reserve0);
              let Reserve1= Number(result._reserve1);
            //   console.log(Reserve1);
             await router.connect(owner).swapExactTokensForTokens(expandTo18Decimals(50),expandTo18Decimals(1), array, owner.address,1678948210);
             let result1 = await Pair_instance.getReserves();
        
             let Reserve2= Number(result1._reserve0);

             Reserve1=Number(result1._reserve1);
                    
             let AmountIn=await router.connect(owner).getAmountsOut(expandTo18Decimals(2),array);
             console.log(AmountIn ,"amount in in the swapping");

             let a1=Number(AmountIn[1]);
             console.log(a1 ,"amount in in the swapping  A1 ");

             
             expect(Reserve0).to.be.lessThan(Reserve2);
          })
    

         ////////////////////REMOVE LIQIUIDITY ETH //////////////////////////////

    it("this is the call of add liquidity ETH --1", async () => {
        // console.log(owner.address ,"this is the owner of the contract;;;;;;;;;;;;;;;");
        let token1 = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000000));
        console.log(await token1.balanceOf(owner.address),"'''''''''''''''balance of address owner''''''''''''''''''");
        const previoustokenCount = await token1.balanceOf(owner.address);
       console.log (await owner.getBalance(),"owenr eth balance ..................");

        await token1.approve(router.address, expandTo18Decimals(10000000));
         
        await router.connect(owner).addLiquidityETH(token1.address, expandTo18Decimals(1000000), expandTo18Decimals(1),
            expandTo18Decimals(1), owner.address, 1678948210, { value: 10000});

            console.log (await owner.getBalance(),"owenr eth balance after the liquidity add ..................");
            console.log(await token1.balanceOf(owner.address),"'''''''''''''''balance of address owner after the liquidity add ''''''''''''''''''");
        
        const pair = await factory.getPair(token1.address, WETH.address);
    

        const Pair_instance = await new UniswapV2Pair__factory(owner).attach(pair);
        let result = await Pair_instance.getReserves();
        // console.log(result , "previous DATA")
             const LPTokens =  await Pair_instance.balanceOf(owner.address);
             console.log(LPTokens ,"lp tokens for  swap tokend for ");

            const Lptokens =LPTokens.div(2);
            const LPTokensOneFourth = (LPTokens.div(4));

        let Reserve0 = Number(result._reserve0);
        let Reserve1 = Number(result._reserve1);        

        const pairData = await Pair_instance.connect(owner).approve(router.address , LPTokens);
        // console.log(pairData,"lppppppppppppppppppppppp");
       await router.connect(owner).removeLiquidityETH(token1.address,LPTokens,expandTo18Decimals(0),expandTo18Decimals(0),owner.address,1678948210);
             let result1 = await Pair_instance.getReserves();
            //  console.log(result1 ,"UPDATED DATA");

             let Reserve2= Number(result1._reserve0);
             console.log(Reserve2);

             Reserve1=Number(result1._reserve1);
            //  console.log(Reserve1);
             let Reserve3=Number(result1._reserve1);
             console.log(Reserve3);

             const LPTokensUpdated =  await Pair_instance.balanceOf(owner.address);
             console.log(LPTokensUpdated ,"lp tokens for UPDATED tokend for ");

             const updateOwnerReserve = await token1.balanceOf(owner.address);
             console.log(updateOwnerReserve,"::::::::::::::::::::::::");

             const updatedETHAfterRemoveLiquidity = await ethers.provider.getBalance(owner.address);
             console.log(updatedETHAfterRemoveLiquidity,":::::::::::::::updatedETHAfterRemoveLiquidity:::::::::");

             

             expect(Number(updateOwnerReserve)).to.lessThanOrEqual(Number(previoustokenCount));

    })

     ////////////////////REMOVE LIQIUIDITY/////////////////////////////

    it("remove liquidity TOkenA , TOkenB", async () => {
        let Token_A = await new ERC20__factory(owner).deploy(expandTo18Decimals(100));
        let Token_B = await new ERC20__factory(owner).deploy(expandTo18Decimals(100));
        console.log(await Token_A.balanceOf(owner.address),"before  add liquidity tokenA");
        console.log(await Token_B.balanceOf(owner.address),"before  add liquidity tokenB");
        const BeforeTokenA =await Token_A.balanceOf(owner.address);
        const BeforeTokenB =await Token_B.balanceOf(owner.address);

        await Token_A.approve(router.address, expandTo18Decimals(100));
        await Token_B.approve(router.address, expandTo18Decimals(100));
       //Add liquidity
        await router.connect(owner).addLiquidity(Token_A.address, Token_B.address, expandTo18Decimals(100),
          expandTo18Decimals(100), expandTo18Decimals(1), expandTo18Decimals(1), owner.address, 1678948210);
    
        const Pair = await factory.getPair(Token_A.address, Token_B.address);
        const pair_instance = await new UniswapV2Pair__factory(owner).attach(Pair);
    
        let result = await pair_instance.getReserves();
      
        let reserve0 = Number(result._reserve0);
        let reserve1 = Number(result._reserve1);
    
        console.log("Reserves of token before removing liquidity A, B  " + reserve0 + " " + reserve1);

        const lP_token = await pair_instance.balanceOf(owner.address);
        console.log("Lp token initially " + lP_token);
    
        await pair_instance.connect(owner).approve(router.address, lP_token);
        //removing the  liquidity token
        await router.connect(owner).removeLiquidity(Token_A.address, Token_B.address, lP_token,
          expandTo18Decimals(1), expandTo18Decimals(1), owner.address, 1678948210);
    
         const lP_token_new = await pair_instance.balanceOf(owner.address);
         console.log("remainig Lp token "+ Number(lP_token_new));
    
        let result1 = await pair_instance.getReserves();
        console.log(result1,"'''''''''''''''''''''''''''");
        let reserve2 = Number(result1._reserve0);
        let reserve3 = Number(result1._reserve1);
        console.log(await Token_A.balanceOf(owner.address),"after Remove liquidity tokenA");
        console.log(await Token_B.balanceOf(owner.address),"after Remove liquidity tokenB");
        const AfterTokenA =await Token_A.balanceOf(owner.address);
        const AfterTokenB =await Token_B.balanceOf(owner.address);

        //expect(Number(BeforeTokenA)).to.be.lessThanOrEqual(Number(AfterTokenA));
         expect(Number(reserve0)).to.greaterThan(Number(reserve2));
         expect(Number(reserve1)).to.greaterThan(Number(reserve3));


        console.log("Reserves of token after removing liquidity " + reserve2, " " + reserve3);
    });
})

})


