// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { User, Shield } from 'lucide-react';

// @ts-ignore;
import { LoginForm } from '@/components/LoginForm';
// @ts-ignore;
import { RegisterForm } from '@/components/RegisterForm';
// @ts-ignore;
import { WechatLoginButtons } from '@/components/WechatLoginButtons';
// @ts-ignore;
import { MiniProgramQrCode } from '@/components/MiniProgramQrCode';
// @ts-ignore;
import { generateSignature } from '@/lib/security';
// @ts-ignore;
import { WECHAT_CONFIG } from '@/lib/wechat-config';
export default function Login(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [isWechatLoading, setIsWechatLoading] = useState(false);
  const [showMiniProgramQr, setShowMiniProgramQr] = useState(false);

  // 微信小程序登录
  const handleMiniProgramLogin = async () => {
    setIsWechatLoading(true);
    try {
      // 模拟小程序扫码登录流程
      setShowMiniProgramQr(true);
      toast({
        title: '小程序扫码登录',
        description: '请使用微信扫描二维码登录'
      });

      // 模拟获取小程序登录码
      setTimeout(() => {
        setShowMiniProgramQr(false);
        toast({
          title: '登录成功',
          description: '小程序扫码登录成功！'
        });
        $w.utils.navigateBack();
      }, 2000);
    } catch (error) {
      console.error('小程序登录失败:', error);
      toast({
        title: '小程序登录失败',
        description: '请稍后重试或使用其他登录方式',
        variant: 'destructive'
      });
      setIsWechatLoading(false);
    }
  };

  // 微信公众号登录
  const handleWechatLogin = async () => {
    setIsWechatLoading(true);
    try {
      // 生成安全签名
      const timestamp = Date.now();
      const signature = generateSignature('GET', '/auth/wechat', {}, timestamp);
      const tcb = await $w.cloud.getCloudInstance();
      tcb.auth().toDefaultLoginPage({
        config_version: "env",
        redirect_uri: window.location.href,
        query: {
          s_domain: $w.utils.resolveStaticResourceUrl("/").replace(/^https?:\/\//, "").split("/")[0],
          provider: "wechat",
          timestamp: timestamp,
          signature: signature,
          appId: WECHAT_CONFIG.miniProgram.appId
        }
      });
    } catch (error) {
      console.error('微信登录失败:', error);
      toast({
        title: '微信登录失败',
        description: '请稍后重试或使用其他登录方式',
        variant: 'destructive'
      });
      setIsWechatLoading(false);
    }
  };

  // 账号密码登录
  const handleLogin = async formData => {
    setIsLoading(true);
    try {
      // 生成安全签名
      const timestamp = Date.now();
      const signature = generateSignature('POST', '/auth/login', formData, timestamp);

      // 这里应该调用真实的登录API
      // 暂时使用托管登录页
      const tcb = await $w.cloud.getCloudInstance();
      tcb.auth().toDefaultLoginPage({
        config_version: "env",
        redirect_uri: window.location.href,
        query: {
          s_domain: $w.utils.resolveStaticResourceUrl("/").replace(/^https?:\/\//, "").split("/")[0],
          timestamp: timestamp,
          signature: signature
        }
      });
    } catch (error) {
      toast({
        title: '登录失败',
        description: error.message || '请检查用户名和密码',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  // 用户注册
  const handleRegister = async formData => {
    if (formData instanceof Error) {
      toast({
        title: '密码不一致',
        description: '两次输入的密码不匹配',
        variant: 'destructive'
      });
      return;
    }
    setIsLoading(true);
    try {
      // 生成安全签名
      const timestamp = Date.now();
      const signature = generateSignature('POST', '/auth/register', formData, timestamp);

      // 这里应该调用真实的注册API
      // 暂时使用托管登录页进行注册
      const tcb = await $w.cloud.getCloudInstance();
      tcb.auth().toDefaultLoginPage({
        config_version: "env",
        redirect_uri: window.location.href,
        query: {
          s_domain: $w.utils.resolveStaticResourceUrl("/").replace(/^https?:\/\//, "").split("/")[0],
          timestamp: timestamp,
          signature: signature
        }
      });
    } catch (error) {
      toast({
        title: '注册失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  // 管理员登录
  const handleAdminLogin = () => {
    toast({
      title: '管理员登录',
      description: '请使用管理员账号登录后台系统'
    });
  };

  // 切换选项卡
  const handleTabChange = tab => {
    setActiveTab(tab);
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800 font-playfair">
            {activeTab === 'login' ? '欢迎回来' : '加入我们'}
          </CardTitle>
          <p className="text-slate-600">
            {activeTab === 'login' ? '登录您的账户' : '创建新账户'}
          </p>
          
          {/* 安全提示 */}
          <div className="flex items-center justify-center mt-2 text-xs text-green-600">
            <Shield className="w-3 h-3 mr-1" />
            <span>通信安全由微信小程序技术保障</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 小程序扫码登录界面 */}
          {showMiniProgramQr ? <MiniProgramQrCode onBack={() => setShowMiniProgramQr(false)} /> : <>
              {/* 微信登录按钮组 */}
              <WechatLoginButtons onMiniProgramLogin={handleMiniProgramLogin} onWechatLogin={handleWechatLogin} isLoading={isWechatLoading} />

              {/* 分隔线 */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">或</span>
                </div>
              </div>

              {/* 选项卡切换 */}
              <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
                <button onClick={() => setActiveTab('login')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'login' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
                  登录
                </button>
                <button onClick={() => setActiveTab('register')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'register' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
                  注册
                </button>
              </div>

              {/* 登录表单 */}
              {activeTab === 'login' && <LoginForm onSubmit={handleLogin} isLoading={isLoading} onAdminLogin={handleAdminLogin} onTabChange={handleTabChange} />}

              {/* 注册表单 */}
              {activeTab === 'register' && <RegisterForm onSubmit={handleRegister} isLoading={isLoading} onTabChange={handleTabChange} />}
            </>}
        </CardContent>
      </Card>
    </div>;
}