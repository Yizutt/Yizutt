// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Card, CardContent } from '@/components/ui';
// @ts-ignore;
import { Eye, Check, X, Trash2 } from 'lucide-react';

export function PendingPostItem({
  post,
  onPreview,
  onApprove,
  onReject,
  onDelete
}) {
  return <Card className="border-0 bg-slate-800/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
            <p className="text-slate-300 text-sm mb-3 line-clamp-3">{post.content}</p>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>作者: {post.authorName || '匿名'}</span>
              <span>提交时间: {post.submitTime}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button size="sm" onClick={() => onPreview(post._id)} variant="outline" className="text-slate-300 border-slate-600">
              <Eye className="w-3 h-3" />
            </Button>
            <Button size="sm" onClick={() => onApprove(post._id)} className="bg-green-600 hover:bg-green-700">
              <Check className="w-3 h-3" />
            </Button>
            <Button size="sm" onClick={() => onReject(post._id)} className="bg-red-600 hover:bg-red-700">
              <X className="w-3 h-3" />
            </Button>
            <Button size="sm" onClick={() => onDelete(post._id)} className="bg-orange-600 hover:bg-orange-700">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
}