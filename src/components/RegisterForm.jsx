// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Input, Label } from '@/components/ui';
// @ts-ignore;
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';

export function RegisterForm({
  onSubmit,
  isLoading,
  onTabChange
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const handleSubmit = e => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return onSubmit(new Error('密码不一致'));
    }
    onSubmit(formData);
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reg-username" className="text-slate-700">用户名</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input id="reg-username" type="text" placeholder="设置用户名" value={formData.username} onChange={e => setFormData({
          ...formData,
          username: e.target.value
        })} className="pl-10" required />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-700">邮箱</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input id="email" type="email" placeholder="请输入邮箱" value={formData.email} onChange={e => setFormData({
          ...formData,
          email: e.target.value
        })} className="pl-10" required />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="reg-password" className="text-slate-700">密码</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input id="reg-password" type={showPassword ? "text" : "password"} placeholder="设置密码" value={formData.password} onChange={e => setFormData({
          ...formData,
          password: e.target.value
        })} className="pl-10 pr-10" required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-slate-700">确认密码</Label>
        <Input id="confirm-password" type={showPassword ? "text" : "password"} placeholder="再次输入密码" value={formData.confirmPassword} onChange={e => setFormData({
        ...formData,
        confirmPassword: e.target.value
      })} required />
      </div>
      
      <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700" disabled={isLoading}>
        {isLoading ? '注册中...' : '注册账户'}
      </Button>

      <div className="text-center">
        <button type="button" onClick={() => onTabChange('login')} className="text-sm text-slate-600 hover:text-slate-800 underline">
          已有账号？立即登录
        </button>
      </div>
    </form>;
}