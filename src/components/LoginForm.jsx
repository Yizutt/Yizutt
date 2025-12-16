// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Input, Label } from '@/components/ui';
// @ts-ignore;
import { Eye, EyeOff, User, Lock } from 'lucide-react';

export function LoginForm({
  onSubmit,
  isLoading,
  onAdminLogin,
  onTabChange
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(formData);
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-slate-700">用户名</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input id="username" type="text" placeholder="请输入用户名" value={formData.username} onChange={e => setFormData({
          ...formData,
          username: e.target.value
        })} className="pl-10" required />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-700">密码</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input id="password" type={showPassword ? "text" : "password"} placeholder="请输入密码" value={formData.password} onChange={e => setFormData({
          ...formData,
          password: e.target.value
        })} className="pl-10 pr-10" required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={isLoading}>
        {isLoading ? '登录中...' : '登录'}
      </Button>
      
      <div className="text-center">
        <button type="button" onClick={onAdminLogin} className="text-sm text-blue-600 hover:text-blue-800 underline">
          管理员登录入口
        </button>
      </div>

      <div className="text-center">
        <button type="button" onClick={() => onTabChange('register')} className="text-sm text-slate-600 hover:text-slate-800 underline">
          还没有账号？立即注册
        </button>
      </div>
    </form>;
}