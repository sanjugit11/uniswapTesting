import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  // solidity: "0.8.10",
    solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;

// import { HardhatUserConfig,task } from "hardhat/config";
// import "@nomiclabs/hardhat-waffle";
// import "hardhat-typechain"; 
// import "hardhat-gas-reporter";
// // import "@typechain/hardhat";
// import "@nomiclabs/hardhat-etherscan";
// import * as dotenv from "dotenv";

// dotenv.config();
// task("accounts", "Prints the list of accounts", async (args, hre) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// export default {
//   networks: {
//     localhost: {
//       url: "http://127.0.0.1:8545",
//     },
//     rinkeby: {
//       url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
//       accounts: {
//         mnemonic: process.env.TESTNET_MNEMONIC,
//       },
//     },
//     testnet: {
//       url: "https://data-seed-prebsc-1-s1.binance.org:8545",
//       chainId: 97,
//       gasPrice: 20000000000,
//       accounts: {
//         mnemonic: process.env.TESTNET_MNEMONIC,
//       },
//     },
//   },
//   etherscan: {
//     apiKey: process.env.ETHERSCAN_API_FOR_TESTNET,
//   },
//   solidity: {
//     compilers: [
//       {
//         version: "0.8.10",
//         settings: {
//           optimizer: {
//             enabled: true,
//             runs: 200,
//           },
//         },
//       },
//     ],
//   },
//   typechain: {
//     outDir: "typechain",
//     target: "ethers-v5",
//   },

//   gasReporter: {
//     enabled: false,
//   },
// };