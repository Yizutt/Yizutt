// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Avatar, AvatarFallback, AvatarImage, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Heart, MessageSquare, Share, Calendar, User, Settings, Crown, Wechat, Shield, Database } from 'lucide-react';

export default function Home(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState('weda'); // weda 或 mysql

  // 获取真实数据
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let result;
        if (dataSource === 'mysql') {
          // 从MySQL获取数据
          result = await $w.cloud.callFunction({
            name: 'mysql-query',
            data: {
              sql: 'SELECT * FROM posts WHERE status = ? ORDER BY created_at DESC LIMIT 10',
              params: ['published'],
              operation: 'query'
            }
          });
          if (result.code === 0) {
            // 转换MySQL数据格式
            const mysqlPosts = result.data.map(item => ({
              _id: item.id,
              title: item.title,
              content: item.content,
              image: item.image_url,
              authorId: item.author_id,
              authorName: item.author_name,
              tags: item.tags ? item.tags.split(',') : [],
              likes: item.likes || 0,
              comments: item.comments || 0,
              publishAt: new Date(item.created_at).getTime(),
              status: item.status
            }));
            setPosts(mysqlPosts);
          } else {
            throw new Error(result.message);
          }
        } else {
          // 从微搭数据源获取数据
          result = await $w.cloud.callDataSource({
            dataSourceName: 'post',
            methodName: 'wedaGetRecordsV2',
            params: {
              pageSize: 10,
              pageNo: 1,
              filter: {
                status: 'published'
              },
              orderBy: [{
                field: 'publishAt',
                order: 'desc'
              }]
            }
          });
          if (result && result.records) {
            setPosts(result.records);
          } else {
            throw new Error('获取内容失败');
          }
        }
      } catch (error) {
        console.error('获取内容失败:', error);
        // 降级到微搭数据源
        if (dataSource === 'mysql') {
          setDataSource('weda');
          toast({
            title: 'MySQL连接失败',
            description: '已切换到微搭数据源',
            variant: 'destructive'
          });
        } else {
          toast({
            title: '获取内容失败',
            description: '请检查网络连接后重试',
            variant: 'destructive'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [dataSource]);
  const handleLike = async postId => {
    if (!$w.auth.currentUser?.userId) {
      toast({
        title: '请先登录',
        description: '登录后即可点赞内容',
        variant: 'destructive'
      });
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
      return;
    }
    try {
      if (dataSource === 'mysql') {
        // MySQL点赞
        await $w.cloud.callFunction({
          name: 'mysql-query',
          data: {
            sql: 'UPDATE posts SET likes = likes + 1 WHERE id = ?',
            params: [postId],
            operation: 'execute'
          }
        });
      } else {
        // 微搭数据源点赞
        await $w.cloud.callDataSource({
          dataSourceName: 'post',
          methodName: 'wedaUpdateV2',
          params: {
            _id: postId,
            likes: {
              $inc: 1
            }
          }
        });
      }
      setPosts(posts.map(post => post._id === postId ? {
        ...post,
        likes: (post.likes || 0) + 1
      } : post));
      toast({
        title: '点赞成功',
        description: '感谢您的支持！'
      });
    } catch (error) {
      toast({
        title: '点赞失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const handleNavigateToPublish = () => {
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
      return;
    }
    $w.utils.navigateTo({
      pageId: 'publish',
      params: {}
    });
  };
  const handleNavigateToProfile = () => {
    if (!$w.auth.currentUser?.userId) {
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
      return;
    }
    $w.utils.navigateTo({
      pageId: 'profile',
      params: {}
    });
  };
  const handleNavigateToAdmin = async () => {
    if (!$w.auth.currentUser?.userId) {
      toast({
        title: '请先登录',
        description: '管理员功能需要登录访问',
        variant: 'destructive'
      });
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
      return;
    }
    try {
      // 检查管理员权限
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'admin_permission',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            userId: $w.auth.currentUser.userId,
            isActive: true
          }
        }
      });
      if (result && result.records && result.records.length > 0) {
        $w.utils.navigateTo({
          pageId: 'admin',
          params: {}
        });
      } else {
        toast({
          title: '权限不足',
          description: '该功能仅限管理员访问',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '权限检查失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
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
      toast({
        title: '微信登录失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const handleUpgradeMembership = () => {
    if (!$w.auth.currentUser?.userId) {
      toast({
        title: '请先登录',
        description: '登录后即可升级会员',
        variant: 'destructive'
      });
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
      return;
    }
    $w.utils.navigateTo({
      pageId: 'payment',
      params: {}
    });
  };
  const toggleDataSource = () => {
    const newDataSource = dataSource === 'mysql' ? 'weda' : 'mysql';
    setDataSource(newDataSource);
    setIsLoading(true);
    toast({
      title: `切换到${newDataSource === 'mysql' ? 'MySQL' : '微搭'}数据源`,
      description: '正在重新加载数据...'
    });
  };
  const isLoggedIn = Boolean($w.auth.currentUser?.userId);
  const isPremium = $w.auth.currentUser?.name?.includes('premium') || false;
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 导航栏 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
              <h1 className="text-2xl font-bold text-slate-800 font-playfair">图文发布</h1>
              
              {/* 数据源切换 */}
              <Button variant="outline" size="sm" onClick={toggleDataSource} className="ml-4 flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span>{dataSource === 'mysql' ? 'MySQL' : '微搭'}</span>
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleNavigateToPublish} className="text-slate-700 hover:text-blue-600">
                发布内容
              </Button>
              
              {isLoggedIn ? <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8 cursor-pointer" onClick={handleNavigateToProfile}>
                    <AvatarImage src={$w.auth.currentUser?.avatarUrl} />
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  {($w.auth.currentUser?.name === 'admin' || $w.auth.currentUser?.type === 'admin') && <Button variant="outline" size="sm" onClick={handleNavigateToAdmin} className="border-orange-300 text-orange-600 hover:bg-orange-50">
                      管理后台
                    </Button>}
                  
                  {!isPremium && <Button variant="default" size="sm" onClick={handleUpgradeMembership} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                      <Crown className="w-4 h-4 mr-1" />
                      升级会员
                    </Button>}
                </div> : <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={handleWechatLogin} className="border-[#07C160] text-[#07C160] hover:bg-[#07C160] hover:text-white">
                    <Wechat className="w-4 h-4 mr-1" />
                    微信登录
                  </Button>
                  <Button variant="default" onClick={() => $w.utils.navigateTo({
                pageId: 'login',
                params: {}
              })} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    登录/注册
                  </Button>
                </div>}
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 欢迎区域 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-800 mb-4 font-playfair">
            发现精彩内容
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            分享你的故事，探索他人的世界。在这里，每一张图片都承载着独特的情感与记忆。
          </p>
          
          {/* 数据源状态 */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            <Badge variant="secondary" className={dataSource === 'mysql' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
              <Database className="w-3 h-3 mr-1" />
              数据源: {dataSource === 'mysql' ? 'MySQL' : '微搭'}
            </Badge>
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm text-slate-500">云托管保障</span>
          </div>
          
          {/* 微信登录提示 */}
          {!isLoggedIn && <div className="mt-6 flex justify-center space-x-4">
              <Button onClick={handleWechatLogin} className="bg-[#07C160] hover:bg-[#06AE56] text-white">
                <Wechat className="w-5 h-5 mr-2" />
                微信一键登录
              </Button>
              <p className="text-sm text-slate-500 self-center">
                快速获取头像和昵称，立即体验
              </p>
            </div>}
        </div>

        {/* 内容网格 */}
        {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="h-48 bg-slate-200 rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>)}
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => <Card key={post._id} className="hover:shadow-lg transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-0 overflow-hidden rounded-lg">
                  {/* 图片区域 */}
                  <div className="relative">
                    <img src={post.image} alt={post.title} className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105" />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-white/90 text-slate-700">
                        {post.tags?.[0] || '默认'}
                      </Badge>
                    </div>
                    {post.isPremium && <div className="absolute top-3 right-3">
                        <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
                          <Crown className="w-3 h-3 mr-1" />
                          会员专属
                        </Badge>
                      </div>}
                  </div>
                  
                  {/* 内容区域 */}
                  <div className="p-4">
                    <CardTitle className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
                      {post.title}
                    </CardTitle>
                    
                    <p className="text-slate-600 text-sm mb-3 line-clamp-3">
                      {post.content}
                    </p>
                    
                    {/* 作者信息 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={post.authorAvatar} />
                          <AvatarFallback className="text-xs">
                            {post.authorName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-slate-600">{post.authorName || '匿名用户'}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">{post.publishAt ? new Date(post.publishAt).toLocaleDateString() : '未知时间'}</span>
                      </div>
                    </div>
                    
                    {/* 互动按钮 */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <Button variant="ghost" size="sm" onClick={() => handleLike(post._id)} className="flex items-center space-x-1 text-slate-600 hover:text-red-500">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes || 0}</span>
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-slate-600 hover:text-blue-500">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments || 0}</span>
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-slate-600 hover:text-green-500">
                        <Share className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>}
        
        {/* 空状态 */}
        {!isLoading && posts.length === 0 && <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Settings className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">暂无内容</h3>
            <p className="text-slate-500 mb-4">成为第一个分享内容的人吧！</p>
            <Button onClick={handleNavigateToPublish}>发布第一篇内容</Button>
          </div>}
      </main>
    </div>;
}