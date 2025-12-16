// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';

export function PendingPostItem({
  post,
  onApprove,
  onReject,
  onPreview,
  onDelete
}) {
  return <Card className="border-0 bg-slate-800/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          <img src={post.image} alt={post.title} className="w-24 h-16 object-cover rounded" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg text-white">{post.title}</h3>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                待审核
              </Badge>
            </div>
            <p className="text-slate-300 text-sm mb-2 line-clamp-2">{post.content}</p>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>作者: {post.author?.name || '匿名用户'}</span>
              <span>提交时间: {post.submitTime}</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <Button size="sm" onClick={() => onApprove(post.id)} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-1" />
            通过
          </Button>
          <Button size="sm" onClick={() => onReject(post.id)} variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/20">
            <XCircle className="w-4 h-4 mr-1" />
            拒绝
          </Button>
          <Button size="sm" variant="outline" onClick={() => onPreview(post.id)} className="border-slate-600 text-slate-400 hover:bg-slate-700">
            <Eye className="w-4 h-4 mr-1" />
            预览
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(post.id)} className="border-red-500 text-red-400 hover:bg-red-500/20">
            <Trash2 className="w-4 h-4 mr-1" />
            删除
          </Button>
        </div>
      </CardContent>
    </Card>;
}