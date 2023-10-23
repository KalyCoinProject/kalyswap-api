import { ethers } from 'ethers';
import { send } from 'worktop/response';

const ADDRESS: string = '0x183F288BF7EEBe1A3f318F4681dF4a70ef32B2f3';

const ABI: string[] = [
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)'
];

const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider('https://rpc.kalychain.io/rpc');

const amountIn: ethers.BigNumberish = ethers.parseEther('1');

const path: string[] = ['0x069255299Bb729399f3CECaBdc73d15d3D10a2A3', '0x37540F0cC489088c01631138Da2E32cF406B83B8'];

const router: ethers.Contract = new ethers.Contract(
    ADDRESS,
    ABI,
    provider,
);

const getKlcPrice = async (ctx: any) => {
    const amounts: ethers.BigNumberish[] = await router.getAmountsOut(amountIn, path);
    const price: string = ethers.formatUnits(amounts[1].toString(), 18);
    return send(200, price);
};

export {
    getKlcPrice
};
