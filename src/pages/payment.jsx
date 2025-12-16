// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { CreditCard, Crown, ArrowLeft, Shield } from 'lucide-react';

// @ts-ignore;
import { PlanCard } from '@/components/PlanCard';
// @ts-ignore;
import { PaymentSummary } from '@/components/PaymentSummary';
// @ts-ignore;
import { generatePaymentSecurity } from '@/lib/security';
export default function Payment(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [plans, setPlans] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  // 检查登录状态
  React.useEffect(() => {
    if (!$w.auth.currentUser?.userId) {
      toast({
        title: '请先登录',
        description: '登录后即可进行支付',
        variant: 'destructive'
      });
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
    }
  }, []);

  // 获取会员套餐和用户信息
  useEffect(() => {
    const fetchData = async () => {
      if (!$w.auth.currentUser?.userId) return;
      try {
        // 获取会员套餐
        const plansResult = await $w.cloud.callDataSource({
          dataSourceName: 'plan',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              isActive: true
            },
            orderBy: [{
              field: 'sortOrder',
              order: 'asc'
            }]
          }
        });
        if (plansResult && plansResult.records) {
          setPlans(plansResult.records);
          // 默认选择第一个套餐
          if (plansResult.records.length > 0) {
            setSelectedPlan(plansResult.records[0]._id);
          }
        }

        // 获取用户信息
        const userResult = await $w.cloud.callDataSource({
          dataSourceName: 'user',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              username: $w.auth.currentUser.name
            }
          }
        });
        if (userResult && userResult.records && userResult.records.length > 0) {
          setUserInfo(userResult.records[0]);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        toast({
          title: '数据获取失败',
          description: '请检查网络连接后重试',
          variant: 'destructive'
        });
      }
    };
    fetchData();
  }, [$w.auth.currentUser?.userId]);
  if (!$w.auth.currentUser?.userId) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>正在跳转登录...</p>
        </div>
      </div>;
  }
  const handlePlanSelect = planId => {
    setSelectedPlan(planId);
  };
  const handleWechatPayment = async () => {
    if (!$w.auth.currentUser?.userId) {
      toast({
        title: '请先登录',
        description: '登录后即可进行支付',
        variant: 'destructive'
      });
      return;
    }
    setIsLoading(true);
    try {
      const selectedPlanData = plans.find(plan => plan._id === selectedPlan);
      if (!selectedPlanData) {
        throw new Error('套餐不存在');
      }

      // 生成支付安全参数
      const paymentData = {
        userId: $w.auth.currentUser.userId,
        planId: selectedPlanData._id,
        planName: selectedPlanData.name,
        amount: selectedPlanData.price,
        description: `购买${selectedPlanData.name}会员`
      };
      const securityParams = generatePaymentSecurity(paymentData);

      // 创建支付记录
      const paymentResult = await $w.cloud.callDataSource({
        dataSourceName: 'payment',
        methodName: 'wedaCreateV2',
        params: {
          ...paymentData,
          paymentMethod: 'wechat',
          status: 'pending',
          timestamp: securityParams.timestamp,
          nonce: securityParams.nonce,
          signature: securityParams.signature
        }
      });
      if (paymentResult) {
        // 模拟支付成功（实际应该调用微信支付API）
        // 更新支付状态为成功
        await $w.cloud.callDataSource({
          dataSourceName: 'payment',
          methodName: 'wedaUpdateV2',
          params: {
            _id: paymentResult._id,
            status: 'success',
            paidAt: new Date().getTime(),
            transactionId: `wx${Date.now()}`,
            expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime() // 30天后到期
          }
        });

        // 更新用户会员状态
        await $w.cloud.callDataSource({
          dataSourceName: 'user',
          methodName: 'wedaUpdateV2',
          params: {
            _id: userInfo?._id,
            isPremium: true,
            premiumExpireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime()
          }
        });
        toast({
          title: '支付成功',
          description: '会员权益已生效，感谢您的支持！'
        });
        $w.utils.navigateBack();
      } else {
        throw new Error('创建支付记录失败');
      }
    } catch (error) {
      console.error('微信支付失败:', error);
      toast({
        title: '支付失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleBack = () => {
    $w.utils.navigateBack();
  };
  const selectedPlanData = plans.find(plan => plan._id === selectedPlan);
  const isCurrentUserPremium = userInfo?.isPremium || false;
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 头部导航 */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="flex items-center space-x-1 text-slate-600">
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </Button>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800 font-playfair">
              会员升级
            </CardTitle>
            <p className="text-slate-600">选择适合您的会员套餐，享受更多权益</p>
            
            {/* 安全提示 */}
            <div className="flex items-center justify-center mt-2 text-sm text-green-600">
              <Shield className="w-4 h-4 mr-1" />
              <span>支付安全由RSA加密技术保障</span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* 套餐选择 */}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">选择套餐</h2>
              {plans.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map(plan => <PlanCard key={plan._id} plan={plan} isSelected={selectedPlan === plan._id} onSelect={handlePlanSelect} isCurrentUserPremium={isCurrentUserPremium} />)}
                </div> : <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">暂无可用套餐</h3>
                  <p className="text-slate-500">请联系管理员配置会员套餐</p>
                </div>}
            </div>

            {/* 支付摘要 */}
            {selectedPlanData && <PaymentSummary selectedPlan={selectedPlanData} onPayment={handleWechatPayment} isLoading={isLoading} />}
          </CardContent>
        </Card>
      </div>
    </div>;
}