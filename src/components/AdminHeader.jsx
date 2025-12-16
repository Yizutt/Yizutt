// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Settings, Shield } from 'lucide-react';

export function AdminHeader({
  onBackToHome
}) {
  return <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBackToHome} className="text-slate-300 hover:text-white">
              <Settings className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <h1 className="text-2xl font-bold text-white font-playfair">管理后台</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-500 text-white">
              <Shield className="w-3 h-3 mr-1" />
              管理员
            </Badge>
          </div>
        </div>
      </div>
    </header>;
}