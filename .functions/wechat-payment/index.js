
// 微信支付云函数
const crypto = require('crypto');
const axios = require('axios');

exports.main = async (event, context) => {
  const { 
    paymentId,
    amount,
    description,
    userId,
    notifyUrl,
    tradeType = 'JSAPI'
  } = event;
  
  try {
    // 验证必要参数
    if (!paymentId || !amount || !userId) {
      throw new Error('缺少必要参数');
    }
    
    // 生成订单号
    const outTradeNo = `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // 微信支付配置
    const appId = 'wx96cd69319d05439f';
    const mchId = process.env.WECHAT_MCH_ID || 'YOUR_MCH_ID'; // 需要配置商户号
    const apiKey = process.env.WECHAT_API_KEY || 'YOUR_API_KEY'; // 需要配置API密钥
    
    // 构建支付参数
    const paymentParams = {
      appid: appId,
      mch_id: mchId,
      nonce_str: generateNonceStr(),
      body: description || '图文发布会员充值',
      out_trade_no: outTradeNo,
      total_fee: Math.round(amount * 100), // 转换为分
      spbill_create_ip: '127.0.0.1',
      notify_url: notifyUrl || 'https://your-domain.com/api/payment/notify',
      trade_type: tradeType,
      openid: userId // 如果是JSAPI支付，需要openid
    };
    
    // 生成签名
    const sign = generateSign(paymentParams, apiKey);
    paymentParams.sign = sign;
    
    // 构建XML请求体
    const xmlData = buildXML(paymentParams);
    
    // 调用微信支付统一下单API
    const response = await axios.post('https://api.mch.weixin.qq.com/pay/unifiedorder', xmlData, {
      headers: {
        'Content-Type': 'application/xml'
      }
    });
    
    // 解析响应
    const result = parseXML(response.data);
    
    if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
      // 生成前端支付参数
      const payParams = {
        appId: appId,
        timeStamp: Math.floor(Date.now() / 1000).toString(),
        nonceStr: generateNonceStr(),
        package: `prepay_id=${result.prepay_id}`,
        signType: 'MD5'
      };
      
      // 生成支付签名
      const paySign = generateSign(payParams, apiKey);
      payParams.paySign = paySign;
      
      // 更新支付记录
      await updatePaymentRecord(paymentId, {
        transactionId: result.prepay_id,
        outTradeNo: outTradeNo,
        status: 'pending'
      });
      
      return {
        code: 0,
        data: {
          payParams: payParams,
          payUrl: result.code_url, // 如果是Native支付
          prepayId: result.prepay_id,
          outTradeNo: outTradeNo
        },
        message: '支付订单创建成功'
      };
    } else {
      throw new Error(result.err_code_des || '支付订单创建失败');
    }
  } catch (error) {
    console.error('微信支付失败:', error);
    return {
      code: -1,
      message: error.message || '微信支付失败',
      error: error.code
    };
  }
};

// 生成随机字符串
function generateNonceStr(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 生成签名
function generateSign(params, apiKey) {
  // 过滤空值并排序
  const filteredParams = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== '' && key !== 'sign')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const stringToSign = `${filteredParams}&key=${apiKey}`;
  return crypto.createHash('md5').update(stringToSign, 'utf8').digest('hex').toUpperCase();
}

// 构建XML
function buildXML(params) {
  let xml = '<xml>';
  for (const key in params) {
    xml += `<${key}><![CDATA[${params[key]}]]></${key}>`;
  }
  xml += '</xml>';
  return xml;
}

// 解析XML（简化版本）
function parseXML(xml) {
  const result = {};
  const matches = xml.match(/<(\w+)><!\[CDATA\[(.*?)\]\]><\/\w+>/g);
  if (matches) {
    matches.forEach(match => {
      const keyMatch = match.match(/<(\w+)>/);
      const valueMatch = match.match(/<!\[CDATA\[(.*?)\]\]>/);
      if (keyMatch && valueMatch) {
        result[keyMatch[1]] = valueMatch[1];
      }
    });
  }
  return result;
}

// 更新支付记录（这里需要调用微搭API）
async function updatePaymentRecord(paymentId, updateData) {
  // 在实际环境中，这里应该调用微搭数据源API更新支付记录
  console.log('更新支付记录:', paymentId, updateData);
  return true;
}
