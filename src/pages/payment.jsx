// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Crown, CreditCard, CheckCircle, ArrowLeft, Shield, Star, Zap, Database } from 'lucide-react';

// @ts-ignore;
import { PlanCard } from '@/components/PlanCard';
// @ts-ignore;
import { PaymentSummary } from '@/components/PaymentSummary';
export default function Payment(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // 检查登录状态
  useEffect(() => {
    if (!$w.auth.currentUser?.userId) {
      toast({
        title: '请先登录',
        description: '登录后即可升级会员',
        variant: 'destructive'
      });
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
      return;
    }
    fetchPaymentData();
  }, []);
  const fetchPaymentData = async () => {
    try {
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

      // 获取会员套餐
      const plansResult = await $w.cloud.callDataSource({
        dataSourceName: 'plan',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            isActive: true
          },
          orderBy: [{
            field: 'price',
            order: 'asc'
          }]
        }
      });
      if (plansResult && plansResult.records) {
        setPlans(plansResult.records);
        // 默认选择第一个套餐
        if (plansResult.records.length > 0) {
          setSelectedPlan(plansResult.records[0]);
        }
      }
    } catch (error) {
      console.error('获取支付数据失败:', error);
      toast({
        title: '数据获取失败',
        description: '请检查网络连接后重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleSelectPlan = plan => {
    setSelectedPlan(plan);
  };
  const handlePayment = async paymentMethod => {
    if (!selectedPlan) {
      toast({
        title: '请选择套餐',
        description: '请先选择一个会员套餐',
        variant: 'destructive'
      });
      return;
    }
    setIsProcessing(true);
    try {
      // 创建支付记录
      const paymentResult = await $w.cloud.callDataSource({
        dataSourceName: 'payment',
        methodName: 'wedaCreateV2',
        params: {
          userId: $w.auth.currentUser.userId,
          planId: selectedPlan._id,
          planName: selectedPlan.name,
          amount: selectedPlan.price,
          period: selectedPlan.period,
          paymentMethod: paymentMethod,
          status: 'pending',
          createdAt: new Date().getTime()
        }
      });
      if (paymentResult) {
        // 调用微信支付云函数
        const wechatResult = await $w.cloud.callFunction({
          name: 'wechat-payment',
          data: {
            paymentId: paymentResult._id,
            amount: selectedPlan.price,
            description: `${selectedPlan.name} - ${selectedPlan.period}`,
            userId: $w.auth.currentUser.userId
          }
        });
        if (wechatResult.code === 0) {
          // 跳转到微信支付页面
          if (wechatResult.data.payUrl) {
            window.open(wechatResult.data.payUrl, '_blank');
          }
          toast({
            title: '支付发起成功',
            description: '请在新窗口完成支付'
          });
        } else {
          throw new Error(wechatResult.message || '支付发起失败');
        }
      } else {
        throw new Error('创建支付记录失败');
      }
    } catch (error) {
      console.error('支付失败:', error);
      toast({
        title: '支付失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handleBackToProfile = () => {
    $w.utils.navigateTo({
      pageId: 'profile',
      params: {}
    });
  };
  const isPremium = userInfo?.isPremium || false;
  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBackToProfile} className="text-slate-600 hover:text-slate-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回个人中心
              </Button>
              <h1 className="text-2xl font-bold text-slate-800 font-playfair">会员中心</h1>
            </div>
            
            {isPremium && <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
                <Crown className="w-3 h-3 mr-1" />
                高级会员
              </Badge>}
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 当前状态 */}
        {isPremium && <Card className="border-0 bg-gradient-to-r from-yellow-50 to-orange-50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    您已是高级会员
                  </h3>
                  <p className="text-slate-600">
                    会员有效期至：{userInfo?.premiumExpireAt ? new Date(userInfo.premiumExpireAt).toLocaleDateString() : '未知时间'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 mb-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    享受所有权益
                  </Badge>
                  <p className="text-sm text-slate-500">可随时续费</p>
                </div>
              </div>
            </CardContent>
          </Card>}

        {/* 会员权益对比 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 font-playfair">会员权益对比</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 免费版 */}
            <Card className="border-0 bg-white/60">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">免费版</CardTitle>
                <p className="text-3xl font-bold text-slate-800">¥0<span className="text-lg font-normal text-slate-600">/月</span></p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-slate-700">基础内容发布</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-slate-700">社区互动功能</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <span className="w-4 h-4 mr-2">✕</span>
                  <span>高清图片上传</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <span className="w-4 h-4 mr-2">✕</span>
                  <span>专属模板库</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <span className="w-4 h-4 mr-2">✕</span>
                  <span>优先内容审核</span>
                </div>
              </CardContent>
            </Card>

            {/* 高级版 */}
            <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
                    <Crown className="w-3 h-3 mr-1" />
                    推荐
                  </Badge>
                </div>
                <CardTitle className="text-lg">高级会员</CardTitle>
                <p className="text-3xl font-bold text-blue-600">¥29<span className="text-lg font-normal text-slate-600">/月</span></p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-slate-700">所有基础功能</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-slate-700">高清图片上传</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-slate-700">专属模板库</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-slate-700">优先内容审核</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-slate-700">专属客服支持</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 套餐选择 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 font-playfair">选择套餐</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => <PlanCard key={plan._id} plan={plan} isSelected={selectedPlan?._id === plan._id} onSelect={() => handleSelectPlan(plan)} />)}
          </div>
        </div>

        {/* 支付汇总 */}
        {selectedPlan && <PaymentSummary selectedPlan={selectedPlan} onPayment={handlePayment} isProcessing={isProcessing} />}

        {/* 支付说明 */}
        <Card className="border-0 bg-slate-50 mt-8">
          <CardHeader>
            <CardTitle className="text-lg">支付说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-800">安全保障</h4>
                <p className="text-sm text-slate-600">所有支付均通过微信官方渠道，资金安全有保障</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-800">即时生效</h4>
                <p className="text-sm text-slate-600">支付成功后会员权益立即生效，无需等待</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Star className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-800">随时取消</h4>
                <p className="text-sm text-slate-600">会员到期后自动续费，可随时在设置中取消</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>;
}