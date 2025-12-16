// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Settings } from 'lucide-react';

export function AdminHeader({
  onBackToHome
}) {
  return <header className="bg-black/20 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold font-playfair text-white">管理员后台</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              管理员
            </Badge>
            <Button variant="outline" size="sm" onClick={onBackToHome} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              返回首页
            </Button>
          </div>
        </div>
      </div>
    </header>;
}