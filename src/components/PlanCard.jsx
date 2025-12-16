// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { CheckCircle, Crown } from 'lucide-react';

export function PlanCard({
  plan,
  isSelected,
  onSelect,
  isCurrentUserPremium
}) {
  const {
    _id,
    name,
    description,
    price,
    period,
    features = [],
    isPopular
  } = plan;
  return <Card className={`cursor-pointer transition-all duration-300 border-2 ${isSelected ? 'border-blue-500 shadow-lg' : 'border-slate-200 hover:border-slate-300'} ${isPopular ? 'relative' : ''}`} onClick={() => onSelect(_id)}>
      {isPopular && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            热门推荐
          </div>
        </div>}
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <h3 className="text-lg font-semibold text-slate-800">{name}</h3>
          {isCurrentUserPremium && <Crown className="w-4 h-4 text-yellow-500 ml-2" />}
        </div>
        <div className="mb-4">
          <span className="text-3xl font-bold text-blue-600">¥{price}</span>
          <span className="text-slate-600">/{period}</span>
        </div>
        <p className="text-slate-600 text-sm mb-4">{description}</p>
        <ul className="space-y-2 text-sm text-slate-600">
          {features.map((feature, index) => <li key={index} className="flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              {feature}
            </li>)}
        </ul>
        <Button className={`mt-4 w-full ${isSelected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          {isSelected ? '已选择' : '选择套餐'}
        </Button>
      </CardContent>
    </Card>;
}