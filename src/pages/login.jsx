// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, useToast } from '@/components/ui';
// @ts-ignore;
import { User, Lock, Mail, Eye, EyeOff, ArrowLeft, Wechat, Shield } from 'lucide-react';

// @ts-ignore;
import { LoginForm } from '@/components/LoginForm';
// @ts-ignore;
import { RegisterForm } from '@/components/RegisterForm';
// @ts-ignore;
import { WechatLoginButtons } from '@/components/WechatLoginButtons';
// @ts-ignore;
import { MiniProgramQrCode } from '@/components/MiniProgramQrCode';
export default function Login(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 检查是否已登录
  React.useEffect(() => {
    if ($w.auth.currentUser?.userId) {
      toast({
        title: '已登录',
        description: '欢迎回来！'
      });
      $w.utils.navigateTo({
        pageId: 'home',
        params: {}
      });
    }
  }, []);
  const handleLogin = async loginData => {
    setIsLoading(true);
    try {
      // 调用云函数进行登录验证
      const result = await $w.cloud.callFunction({
        name: 'user-auth',
        data: {
          action: 'login',
          username: loginData.username,
          password: loginData.password
        }
      });
      if (result.code === 0) {
        // 登录成功，更新用户信息
        await $w.auth.getUserInfo({
          force: true
        });
        toast({
          title: '登录成功',
          description: `欢迎回来，${result.data.username}！`
        });
        $w.utils.navigateTo({
          pageId: 'home',
          params: {}
        });
      } else {
        throw new Error(result.message || '登录失败');
      }
    } catch (error) {
      console.error('登录失败:', error);
      toast({
        title: '登录失败',
        description: error.message || '用户名或密码错误',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleRegister = async registerData => {
    setIsLoading(true);
    try {
      // 检查用户名是否已存在
      const checkResult = await $w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            username: registerData.username
          }
        }
      });
      if (checkResult && checkResult.records && checkResult.records.length > 0) {
        throw new Error('用户名已存在');
      }

      // 检查邮箱是否已存在
      if (registerData.email) {
        const emailCheckResult = await $w.cloud.callDataSource({
          dataSourceName: 'user',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              email: registerData.email
            }
          }
        });
        if (emailCheckResult && emailCheckResult.records && emailCheckResult.records.length > 0) {
          throw new Error('邮箱已被注册');
        }
      }

      // 创建新用户
      const createResult = await $w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaCreateV2',
        params: {
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
          // 实际应用中应该加密
          nickName: registerData.nickName || registerData.username,
          isPremium: false,
          createdAt: new Date().getTime(),
          lastLoginAt: new Date().getTime(),
          loginCount: 0
        }
      });
      if (createResult) {
        toast({
          title: '注册成功',
          description: '请使用新账号登录'
        });
        setIsLogin(true); // 切换到登录页面
      } else {
        throw new Error('注册失败');
      }
    } catch (error) {
      console.error('注册失败:', error);
      toast({
        title: '注册失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleWechatLogin = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      tcb.auth().toDefaultLoginPage({
        config_version: "env",
        redirect_uri: window.location.href,
        query: {
          s_domain: $w.utils.resolveStaticResourceUrl("/").replace(/^https?:\/\//, "").split("/")[0],
          provider: "wechat"
        }
      });
    } catch (error) {
      console.error('微信登录失败:', error);
      toast({
        title: '微信登录失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const handleBackToHome = () => {
    $w.utils.navigateTo({
      pageId: 'home',
      params: {}
    });
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 返回按钮 */}
        <Button variant="ghost" onClick={handleBackToHome} className="mb-6 text-slate-600 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800 font-playfair">
              {isLogin ? '欢迎登录' : '创建账号'}
            </CardTitle>
            <p className="text-slate-600">
              {isLogin ? '登录您的账号以继续' : '注册新账号开始使用'}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 登录/注册表单 */}
            {isLogin ? <LoginForm onSubmit={handleLogin} isLoading={isLoading} /> : <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />}

            {/* 分隔线 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">或</span>
              </div>
            </div>

            {/* 第三方登录 */}
            <div className="space-y-4">
              <WechatLoginButtons onWechatLogin={handleWechatLogin} />
              
              {/* 小程序码 */}
              <MiniProgramQrCode />
            </div>

            {/* 切换登录/注册 */}
            <div className="text-center">
              <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                {isLogin ? '还没有账号？立即注册' : '已有账号？立即登录'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}