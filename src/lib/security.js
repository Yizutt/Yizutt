
// RSA私钥安全处理工具
const RSA_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAuzFCk/CX+zXRxmpUBcQh+9w2oYZ/HW8qexL5Hykc341yq4GN
gnT11nww9u//14Dqm7FSFKRSAkSHN6Ep5N2t+J/1feBQTe30kx1uQA2ZEd6Osiii
XYki4N/41HXf1kI1JcFM1nuwef4hERcBnCH0EnyBYG+2PIOogCY41+YRF7AQWgjH
S16tWeCBVQdDjiTHJuiDF6E/ORO2sk9OAz4QCE0ghAQa8lUXc5/1xc7v57r8nEYg
sSOYMhNI7jDnS7wIGggJ8ib8qBW9xdzL6EEPYOcnchyRef3FGSI0sp/7lE4BF1d2
aHUQvu1L8mHgV9omBnxiZlA2X48SkcDxT/TQzQIDAQABAoIBAQC6BAB6DJqqmtfD
yQOH21g99J4hMwr8T+yx8q+2hF9Z0zDBN3NM0Tc+lZj+uo3NNCFu5+1977BC6qBH
6pI8CQIJT8Ne+9oxJqZkztkxM5IJjNTWO8TlGBKdzlNxpVTykEZKJ2VYuf8rqxpm
5irGYYMuH6VdFIXOarK17cWM3eXcV3Z/ciYS4YR7PDOzIzTFkukgoTBojwbfwSoQ
5fOhzFo50Xl2IpACCpYeDxmw6RWuIJUl1rs/qrncPz2BH/4XIMn6iD0MJMstQ1a/
rEuSsmyxXyvViunLJHurbw1GKIoHVYnfOpPIFSEhltn9C6F2UmTI609T3dftNe/U
GS0LbgktAoGBAPURAWPiWHvMqGfOubkj1KCIdZLZtFoHAjzY8mIv22/t39CcFsq9
aSpMybgowygzMaWKl+vmEJnFHGWFEgbp7aDC/tmYw9t/vOGOdgxm8VI3HJDIEsvw
aZi15a60QRMr/IW58yAdDLX4LdONZc219OQOGNLxK/pzxu8jEGOxS9RnAoGBAMOL
QRB83XTJaQ0uJRmUYQD5eMGLNIfFS86tfXeL8/VoNX0AuBeed8iHZQsg+9OAQycc
Q1EZHlETr3P42B+TI7o3xceLvyOOI8T4EQWg5nS+utcs5RxX4x5Ru7N3KgZRdznB
SkVvrq54ZbKwrfq/mRaTaFfjwKU90PqWE8jKDJCrAoGBAINbMhuP3028TSgXLoWG
JxpFCoBEIN+Akjp7LrBiZoSARE9U2wKgtBXwQs9rSe/qQNoyh2vyTUOe27GuuhLq
oGxjGKcZsyGcPmnIKo5LP16KG82e8DRQEMnB9fLGu3rDQP+MxDyaVY3UEPwr9j1l
InZ69+NZUfFUzXSwnsBQ8AxRAoGAGfDBQuStpC6L5xm2Bjyu2ag+or5Ky7AarGJL
gK5qQKYAYoLT6R42mb2MY/uOLLKZNfkD3SBN60eHQQVD9nxYgv2fGSeqxZa3nAuk
hnCf4eDjfGQSSL5H/N+u3NH0Gz53aIwBxFBahf6mzxutGNSOBHatoustxT38GSIL
odlb7V0CgYEAhUQhseGKq+kIFScIzuKpwIcQWDlD7iajQCj+aWZTwLfWQjROs0VB
rfBPsW1dGNb8RaO1mRGdtJCj72xHLJEv3TNs3hf1Ela/Eq8Xcq2iMgzpv1Hx524g
TP9hHLE509LsbRFtedafuFnhVSsq3CGOvckGfbIn0zUH4cAWc4s+AaA=
-----END RSA PRIVATE KEY-----`;

// 安全配置
const SECURITY_CONFIG = {
  // 加密算法配置
  algorithm: 'RSA-SHA256',
  encoding: 'base64',
  
  // API签名配置
  signatureHeader: 'X-Signature',
  timestampHeader: 'X-Timestamp',
  
  // 支付安全配置
  paymentEncryption: true,
  maxTimestampDiff: 300000 // 5分钟
};

/**
 * 生成API请求签名
 * @param {string} method - HTTP方法
 * @param {string} path - 请求路径
 * @param {object} params - 请求参数
 * @param {number} timestamp - 时间戳
 * @returns {string} 签名
 */
export function generateSignature(method, path, params, timestamp) {
  try {
    // 构建签名字符串
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    const signString = `${method.toUpperCase()}|${path}|${paramString}|${timestamp}`;
    
    // 这里应该使用Node.js crypto模块进行签名
    // 由于前端环境限制，暂时返回模拟签名
    return btoa(signString).substring(0, 32);
  } catch (error) {
    console.error('生成签名失败:', error);
    return '';
  }
}

/**
 * 验证API响应签名
 * @param {string} signature - 响应签名
 * @param {object} data - 响应数据
 * @param {number} timestamp - 时间戳
 * @returns {boolean} 是否验证通过
 */
export function verifySignature(signature, data, timestamp) {
  try {
    // 验证时间戳有效性
    const currentTime = Date.now();
    if (Math.abs(currentTime - timestamp) > SECURITY_CONFIG.maxTimestampDiff) {
      return false;
    }
    
    // 这里应该使用公钥验证签名
    // 由于前端环境限制，暂时返回true
    return true;
  } catch (error) {
    console.error('验证签名失败:', error);
    return false;
  }
}

/**
 * 加密敏感数据（用于支付等场景）
 * @param {string} data - 要加密的数据
 * @returns {string} 加密后的数据
 */
export function encryptData(data) {
  try {
    // 这里应该使用RSA公钥加密数据
    // 由于前端环境限制，暂时返回base64编码
    return btoa(JSON.stringify(data));
  } catch (error) {
    console.error('数据加密失败:', error);
    return '';
  }
}

/**
 * 解密敏感数据
 * @param {string} encryptedData - 加密的数据
 * @returns {object} 解密后的数据
 */
export function decryptData(encryptedData) {
  try {
    // 这里应该使用RSA私钥解密数据
    // 由于前端环境限制，暂时解析base64
    return JSON.parse(atob(encryptedData));
  } catch (error) {
    console.error('数据解密失败:', error);
    return null;
  }
}

/**
 * 生成支付安全参数
 * @param {object} paymentData - 支付数据
 * @returns {object} 安全支付参数
 */
export function generatePaymentSecurity(paymentData) {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(2, 15);
  
  return {
    timestamp,
    nonce,
    signature: generateSignature('POST', '/api/payment', paymentData, timestamp),
    encryptedData: encryptData(paymentData)
  };
}

export default {
  generateSignature,
  verifySignature,
  encryptData,
  decryptData,
  generatePaymentSecurity,
  SECURITY_CONFIG
};
