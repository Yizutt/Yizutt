// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Label, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Image, Tag, X, Upload, Save } from 'lucide-react';

export default function Publish(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    image: '',
    imageFile: null
  });
  const [currentTag, setCurrentTag] = useState('');

  // 检查登录状态
  React.useEffect(() => {
    if (!$w.auth.currentUser?.userId) {
      toast({
        title: '请先登录',
        description: '登录后即可发布内容',
        variant: 'destructive'
      });
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
    }
  }, []);
  if (!$w.auth.currentUser?.userId) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>正在跳转登录...</p>
        </div>
      </div>;
  }
  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };
  const handleRemoveTag = tagToRemove => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };
  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (file) {
      // 检查文件大小（限制5MB）
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: '文件过大',
          description: '图片大小不能超过5MB',
          variant: 'destructive'
        });
        return;
      }
      setUploadingImage(true);
      try {
        // 读取文件为base64
        const reader = new FileReader();
        reader.onload = async event => {
          try {
            // 调用云函数上传到云储存
            const uploadResult = await $w.cloud.callFunction({
              name: 'upload-file',
              data: {
                fileData: event.target.result.split(',')[1],
                // 去除data:image前缀
                fileName: file.name,
                fileType: file.type
              }
            });
            if (uploadResult.code === 0) {
              setFormData({
                ...formData,
                image: uploadResult.data.fileUrl,
                imageFile: file
              });
              toast({
                title: '图片上传成功',
                description: '图片已保存到云储存'
              });
            } else {
              throw new Error(uploadResult.message);
            }
          } catch (error) {
            console.error('图片上传失败:', error);
            toast({
              title: '图片上传失败',
              description: error.message || '请稍后重试',
              variant: 'destructive'
            });
          } finally {
            setUploadingImage(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setUploadingImage(false);
        toast({
          title: '图片处理失败',
          description: error.message || '请检查图片格式',
          variant: 'destructive'
        });
      }
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: '请填写完整信息',
        description: '标题和内容不能为空',
        variant: 'destructive'
      });
      return;
    }
    setIsLoading(true);
    try {
      // 创建文章记录到微搭数据源
      const postResult = await $w.cloud.callDataSource({
        dataSourceName: 'post',
        methodName: 'wedaCreateV2',
        params: {
          title: formData.title,
          content: formData.content,
          image: formData.image,
          authorId: $w.auth.currentUser.userId,
          authorName: $w.auth.currentUser.name || '匿名用户',
          authorAvatar: $w.auth.currentUser.avatarUrl,
          tags: formData.tags,
          likes: 0,
          comments: 0,
          views: 0,
          isPremium: false,
          status: 'pending',
          publishAt: new Date().getTime()
        }
      });
      if (postResult) {
        // 同步到MySQL数据库
        const syncResult = await $w.cloud.callFunction({
          name: 'sync-data',
          data: {
            action: 'syncToMySQL',
            tableName: 'posts',
            data: [{
              id: postResult._id,
              title: formData.title,
              content: formData.content,
              image_url: formData.image,
              author_id: $w.auth.currentUser.userId,
              author_name: $w.auth.currentUser.name || '匿名用户',
              author_avatar: $w.auth.currentUser.avatarUrl,
              tags: formData.tags.join(','),
              likes: 0,
              comments: 0,
              views: 0,
              is_premium: false,
              status: 'pending',
              created_at: new Date().toISOString()
            }]
          }
        });
        if (syncResult.code === 0) {
          toast({
            title: '发布成功',
            description: '您的内容已提交审核，并同步到数据库！'
          });
          $w.utils.navigateBack();
        } else {
          // 即使同步失败，也提示发布成功
          console.warn('数据同步失败:', syncResult.message);
          toast({
            title: '发布成功',
            description: '您的内容已提交审核！'
          });
          $w.utils.navigateBack();
        }
      } else {
        throw new Error('发布失败');
      }
    } catch (error) {
      console.error('发布失败:', error);
      toast({
        title: '发布失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <Image className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800 font-playfair">
              发布新内容
            </CardTitle>
            <p className="text-slate-600">分享你的故事和图片（支持云储存上传）</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 标题 */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-700 text-lg">标题</Label>
                <Input id="title" type="text" placeholder="请输入内容标题" value={formData.title} onChange={e => setFormData({
                ...formData,
                title: e.target.value
              })} className="text-lg py-3" required />
              </div>
              
              {/* 内容 */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-slate-700 text-lg">内容</Label>
                <Textarea id="content" placeholder="请输入详细内容..." value={formData.content} onChange={e => setFormData({
                ...formData,
                content: e.target.value
              })} className="min-h-32 text-base leading-relaxed" required />
              </div>
              
              {/* 图片上传 */}
              <div className="space-y-2">
                <Label className="text-slate-700 text-lg">封面图片</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {uploadingImage ? <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-slate-600">图片上传中...</p>
                    </div> : formData.image ? <div className="relative">
                      <img src={formData.image} alt="预览" className="max-h-64 mx-auto rounded-lg shadow-md" />
                      <button type="button" onClick={() => setFormData({
                    ...formData,
                    image: '',
                    imageFile: null
                  })} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div> : <div>
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600 mb-2">点击或拖拽图片到此区域上传</p>
                      <p className="text-sm text-slate-500">支持 JPG、PNG 格式，最大 5MB</p>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>}
                </div>
              </div>
              
              {/* 标签 */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-slate-700 text-lg">标签</Label>
                <div className="flex space-x-2">
                  <Input id="tags" type="text" placeholder="输入标签后按回车添加" value={currentTag} onChange={e => setCurrentTag(e.target.value)} onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }} />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* 标签展示 */}
                {formData.tags.length > 0 && <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-blue-600">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>)}
                  </div>}
              </div>
              
              {/* 发布按钮 */}
              <div className="flex space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={() => $w.utils.navigateBack()} className="flex-1">
                  取消
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700" disabled={isLoading || uploadingImage}>
                  {isLoading || uploadingImage ? <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {uploadingImage ? '上传中...' : '发布中...'}
                    </> : <>
                      <Save className="w-4 h-4 mr-2" />
                      立即发布
                    </>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>;
}