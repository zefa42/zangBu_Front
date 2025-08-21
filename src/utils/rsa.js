import JSEncrypt from 'jsencrypt'

// 공개키는 백엔드에서 내려주는 걸 세션에 저장해두거나
// 환경변수에 넣어둘 수도 있음
const PUBLIC_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiu/GZTW7SfMb/CAUp96uEwrtOizmCLOVK19aaS2hJ17hGFd1/B58b6yL2F49QOFbHN8tmjB+i46a542oWF1Ar7gqQ2aTDA7N97N07zVdC9H7n/tp3jjl1qkDUTl2frlQtij/ImugUIeLuy6JQbFQO1EIIOJuEJeGUniDPcGqOAyHAFbkghAfa9gY2CdRivF0pugWVJjCmFzelsWjZ18SFj4CxQ+4T1qbdUOjagyorZf658H62/0dHV1dPybIba1SGpSHrKUfAXnLUkkYCXyfBs+c7TU5powoN9nlge3YxPF2Mfi6mo4hnq+mC/qDXq4p0m7Do9fQDtuSqduC9KUhkwIDAQAB'
export function encryptRsa(text) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(PUBLIC_KEY)
  return encryptor.encrypt(text)
}
