// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Wechat, DollarSign, Shield } from 'lucide-react';

export function PaymentSummary({
  selectedPlan,
  onPayment,
  isLoading
}) {
  if (!selectedPlan) {
    return null;
  }
  return <div className="bg-slate-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">支付方式</h3>
      
      <div className="space-y-4">
        {/* 微信支付 */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#07C160] rounded-full flex items-center justify-center">
              <Wechat className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">微信支付</div>
              <div className="text-sm text-slate-500">推荐使用，安全便捷</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-slate-800">¥{selectedPlan.price}</div>
            <div className="text-sm text-slate-500">{selectedPlan.name}</div>
          </div>
        </div>

        {/* 安全保障 */}
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <Shield className="w-4 h-4 text-green-500" />
          <span>支付安全由微信支付保障</span>
        </div>
      </div>

      {/* 支付按钮 */}
      <div className="flex space-x-4 mt-6">
        <Button variant="outline" className="flex-1">
          取消
        </Button>
        <Button onClick={onPayment} disabled={isLoading} className="flex-1 bg-[#07C160] hover:bg-[#06AE56] text-white font-medium py-3">
          {isLoading ? <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              支付中...
            </> : <>
              <DollarSign className="w-5 h-5 mr-2" />
              立即支付 ¥{selectedPlan.price}
            </>}
        </Button>
      </div>
    </div>;
}