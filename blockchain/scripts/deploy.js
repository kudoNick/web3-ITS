const path = require("path");
const fs = require("fs");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const provider = ethers.provider;
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  const adminAddress = await deployer.getAddress();

  const TokenERC20 = await ethers.getContractFactory("TokenERC20");
  const tokenERC20 = await TokenERC20.deploy();
  await tokenERC20.waitForDeployment();

  const TokenERC721 = await ethers.getContractFactory("TokenERC721");
  const tokenERC721 = await TokenERC721.deploy();
  await tokenERC721.waitForDeployment();

  const ContractHandle = await ethers.getContractFactory("ContractHandle");
  const contractHandle = await ContractHandle.deploy(
    await tokenERC20.getAddress(),
    await tokenERC721.getAddress()
  );

  const deploymentReceipt = await contractHandle
    .deploymentTransaction()
    .wait(1);

  console.log("TokenERC20 address:", await tokenERC20.getAddress());
  console.log("TokenERC721 address:", await tokenERC721.getAddress());
  console.log("ContractHandle address:", await contractHandle.getAddress());

  saveContractInfoFrontend(
    await contractHandle.getAddress(),
    await tokenERC20.getAddress(),
    await tokenERC721.getAddress(),
    adminAddress
  );
  saveContractInfoBackend(
    await contractHandle.getAddress(),
    deploymentReceipt.blockNumber
  );
}

function saveContractInfoFrontend(
  contractHandle,
  tokenERC20,
  tokenERC721,
  adminAddress
) {
  const fs = require("fs");
  const contractsDir = path.join(
    __dirname,
    "..",
    "..",
    "frontend",
    "src",
    "contracts"
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify(
      {
        contractHandle: contractHandle,
        tokenERC20: tokenERC20,
        tokenERC721: tokenERC721,
        adminAddress: adminAddress,
      },
      undefined,
      2
    )
  );

  const contractList = [
    { name: "ContractHandle" },
    { name: "TokenERC20" },
    { name: "TokenERC721" },
  ];
  contractList.forEach((contract) => {
    const artifact = artifacts.readArtifactSync(contract.name);
    fs.writeFileSync(
      path.join(contractsDir, `${contract.name}.json`),
      JSON.stringify(artifact, null, 2)
    );
  });
}
function saveContractInfoBackend(contractHandle, blockNumber) {
  const fs = require("fs");
  const contractsDir = path.join(
    __dirname,
    "..",
    "..",
    "backend",
    "app",
    "contracts"
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify(
      {
        contractHandle: contractHandle,
        blockNumber: blockNumber,
      },
      undefined,
      2
    )
  );

  const contractList = [{ name: "ContractHandle" }];
  contractList.forEach((contract) => {
    const artifact = artifacts.readArtifactSync(contract.name);
    fs.writeFileSync(
      path.join(contractsDir, `${contract.name}.json`),
      JSON.stringify(artifact, null, 2)
    );
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
