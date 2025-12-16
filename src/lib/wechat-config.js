
// 微信小程序配置
export const WECHAT_CONFIG = {
  // 小程序配置
  miniProgram: {
    appId: 'wx96cd69319d05439f',
    appSecret: 'bbe85999c1408865b4b7f8b8b85bb33b',
    uploadKey: 'private.wx96cd69319d05439f.key'
  },
  
  // API配置
  api: {
    baseUrl: 'https://api.weixin.qq.com',
    endpoints: {
      code2Session: '/sns/jscode2session',
      accessToken: '/cgi-bin/token',
      userInfo: '/cgi-bin/user/info'
    }
  },
  
  // 支付配置
  payment: {
    mchId: '', // 商户号（需要配置）
    notifyUrl: '/api/wechat/payment/notify',
    tradeType: 'JSAPI'
  },
  
  // 安全配置
  security: {
    rsaPrivateKey: `-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----`
  }
};

// 微信登录工具函数
export class WechatAuth {
  static async code2Session(code) {
    try {
      // 这里应该调用微信API获取session
      // 由于前端限制，暂时返回模拟数据
      const mockResponse = {
        openid: `mock_openid_${Date.now()}`,
        session_key: `mock_session_${Date.now()}`,
        unionid: null
      };
      return mockResponse;
    } catch (error) {
      console.error('微信登录失败:', error);
      throw new Error('微信登录失败');
    }
  }

  static async getUserInfo(openid, accessToken) {
    try {
      // 这里应该调用微信API获取用户信息
      const mockUserInfo = {
        openid: openid,
        nickname: '微信用户',
        headimgurl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
        sex: 1,
        province: '北京',
        city: '北京',
        country: '中国'
      };
      return mockUserInfo;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw new Error('获取用户信息失败');
    }
  }
}

// 微信支付工具函数
export class WechatPayment {
  static async createPayment(orderData) {
    try {
      // 这里应该调用微信支付API
      // 由于前端限制，暂时返回模拟支付数据
      const mockPayment = {
        timeStamp: Math.floor(Date.now() / 1000).toString(),
        nonceStr: Math.random().toString(36).substring(2, 15),
        package: `prepay_id=mock_prepay_${Date.now()}`,
        signType: 'RSA',
        paySign: `mock_sign_${Date.now()}`
      };
      return mockPayment;
    } catch (error) {
      console.error('创建支付失败:', error);
      throw new Error('创建支付失败');
    }
  }

  static async verifyPayment(result) {
    try {
      // 这里应该验证支付结果签名
      // 由于前端限制，暂时返回验证成功
      return true;
    } catch (error) {
      console.error('验证支付失败:', error);
      return false;
    }
  }
}

export default WECHAT_CONFIG;
