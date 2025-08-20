import JSEncrypt from 'jsencrypt'

// 공개키는 백엔드에서 내려주는 걸 세션에 저장해두거나
// 환경변수에 넣어둘 수도 있음
const PUBLIC_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArX+tNbBV+N2BIxzI2JoduT+LWZBL5AQXEGAZ4p5wDw5D6QYZ5YXMgn2Kfo49BtQKdE3AJl95jSbBdt7h0SaQ/+SkWLaba5/h2SerPwbXuIGLtyUlkfZl/dDX29YSnye7Y0GBCU5IqILaAsyXG1yGfwYVGpbZuCAtspjxYwjxQ7z2htMCo4XAXdro5mjgJnKqtUySfnbB5vGB5lqbb8m2OZz9wdc/GMgyn8nha/8/Rj1HT18m4HW1wfQoS6Gxb6ARJfQ9PtEEorz9l+y3KzOIIcyQd7AugN8hCmE5RjSQf4ajktB1fFAFjQpnDQPOI7b2q3gJTKgLUyghSoBj5p8cVwIDAQAB'

export function encryptRsa(text) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(PUBLIC_KEY)
  return encryptor.encrypt(text)
}
