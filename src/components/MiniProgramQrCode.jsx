// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { QrCode } from 'lucide-react';

export function MiniProgramQrCode({
  onBack
}) {
  return <div className="text-center p-6 bg-slate-50 rounded-lg">
      <div className="w-32 h-32 mx-auto mb-4 bg-white p-4 rounded-lg shadow-md">
        <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-500 rounded flex items-center justify-center">
          <QrCode className="w-16 h-16 text-white" />
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-2">使用微信扫一扫登录</p>
      <p className="text-xs text-slate-500">打开微信，扫描上方二维码</p>
      <Button variant="outline" onClick={onBack} className="mt-4">
        返回登录方式
      </Button>
    </div>;
}