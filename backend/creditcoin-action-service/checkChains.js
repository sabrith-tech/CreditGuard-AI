import { chainInfo } from '@gluwa/usc-sdk';
import { JsonRpcProvider } from 'ethers';

const creditcoinProvider = new JsonRpcProvider('https://rpc.cc3-testnet.creditcoin.network/');
const chainInfoProvider = new chainInfo.PrecompileChainInfoProvider(creditcoinProvider);

const supportedChains = await chainInfoProvider.getSupportedChains();
console.log(supportedChains);