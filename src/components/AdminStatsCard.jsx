// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent } from '@/components/ui';

export function AdminStatsCard({
  title,
  value,
  icon: Icon,
  color,
  change
}) {
  return <Card className="border-0 bg-slate-800/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">{title}</p>
            <p className="text-2xl font-bold mt-1 text-white">{value}</p>
            <p className="text-green-400 text-xs mt-1">{change}</p>
          </div>
          <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-full flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>;
}