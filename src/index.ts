import {AbiCoder, getBytes, isHexString, parseEther, toUtf8Bytes} from "ethers"
import {G1} from "mcl-wasm"
import {BlsBn254} from "./BlsBn254"

const secretKeyHex = "0x66c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b786966"
const DST = "BLOCKLOCK_BN254G1_XMD:KECCAK-256_SVDW_RO_H1_"
// create a message by abi encoding it
const recipient = "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF"
const amount = parseEther("1")
const nonce = 0
const m = AbiCoder.defaultAbiCoder().encode(["address", "uint256", "uint256"], [recipient, amount, nonce])

async function main() {
    const bls = await BlsBn254.create()
    const key = bls.createKeyPair(secretKeyHex)

    const magicalM = isHexString(m) ? getBytes(m) : toUtf8Bytes(m) // this does stuff nobody can explain
    const h_m = bls.hashToPoint(Buffer.from(DST), magicalM)
    const {signature} = bls.sign(h_m, key.secretKey)
    const sigBytes = g1BytesHex(bls, signature)

    console.log("ethereum bigint public key")
    console.log(bls.serialiseG2Point(key.pubKey))
    console.log()

    console.log("m")
    console.log(m)
    console.log()

    console.log("h_m")
    console.log(g1BytesHex(bls, h_m))
    console.log()

    console.log("sig")
    console.log(sigBytes)
    console.log()
}

function g1BytesHex(bls: BlsBn254, g1: G1): string {
    const p = bls.serialiseG1Point(g1)
    return AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [p[0], p[1]])
}

main()