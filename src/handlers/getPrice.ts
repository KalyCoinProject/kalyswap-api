import { ethers } from 'ethers';
import { send } from 'worktop/response';

// Get the secret key and app ID from the environment variable
export interface Env {
    APP_ID: string;
    SECRET_KEY: string;
  }
  


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

class HmacUtil {
    static async hmac256(key: string, msg: string): Promise<string> {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(key);
        const msgData = encoder.encode(msg);
    
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
    
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
        const signatureArray = Array.from(new Uint8Array(signature));
        const signatureHex = signatureArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        return signatureHex;
    }

    static getStringToSign(params: {[key: string]: any}): string {
        const treeMap = new Map(Object.entries(params).sort());
        let s2s = '';
        for (const [k, v] of treeMap) {
            if (!k || typeof v === 'object') continue;
            if (v !== null && v !== undefined && String(v)) s2s += `${k}=${v}&`;
        }
        return s2s.slice(0, -1);
    }
}

const getKlcPrice = async (ctx: any) => {
    try {
        const amounts: ethers.BigNumberish[] = await router.getAmountsOut(amountIn, path);
        const price: string = ethers.formatUnits(amounts[1].toString(), 18);
        
        // Construct the response
        const response = {
            data: {
                price: price,
                networkList: [
                    {
                        network: "KALY",
                        networkFee: "6.82733"
                    }
                ]
            },
            success: true,
            returnCode: "0000",
            returnMsg: "Success",
        };

        // Generate the timestamp
        const timestamp = String(Date.now());

        // Create the signature
        const encoder = new TextEncoder();
        const data = encoder.encode(APP_ID + SECRET_KEY + timestamp);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Send the response with the required headers
        return send(200, JSON.stringify(response), {
            'Content-Type': 'application/json; charset=utf-8',
            'appId': APP_ID,
            'timestamp': timestamp,
            'sign': hashHex
        });
    } catch (error) {
        console.error("Error fetching KLC price:", error);
        return send(500, {
            data: null,
            success: false,
            returnCode: "9999",
            returnMsg: "Internal server error",
        }, {
            'Content-Type': 'application/json; charset=utf-8'
        });
    }
}


export {
    getKlcPrice
};
