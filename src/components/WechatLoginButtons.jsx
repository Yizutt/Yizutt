// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Wechat, QrCode } from 'lucide-react';

export function WechatLoginButtons({
  onMiniProgramLogin,
  onWechatLogin,
  isLoading
}) {
  return <div className="space-y-3">
      <Button onClick={onMiniProgramLogin} disabled={isLoading} className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium py-3">
        {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <QrCode className="w-5 h-5 mr-2" />}
        小程序扫码登录
      </Button>
      
      <Button onClick={onWechatLogin} disabled={isLoading} className="w-full bg-[#07C160] hover:bg-[#06AE56] text-white font-medium py-3">
        {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <Wechat className="w-5 h-5 mr-2" />}
        微信公众号登录
      </Button>
      
      <p className="text-xs text-center text-slate-500">
        支持小程序扫码和公众号授权登录
      </p>
    </div>;
}