// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Avatar, AvatarFallback, AvatarImage, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { User, Settings, LogOut, Edit, Heart, MessageSquare, Calendar, Crown, Wechat, CreditCard, CheckCircle, XCircle, Database } from 'lucide-react';

export default function Profile(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isWechatBound, setIsWechatBound] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [dataSource, setDataSource] = useState('weda');

  // 检查登录状态
  React.useEffect(() => {
    if (!$w.auth.currentUser?.userId) {
      toast({
        title: '请先登录',
        description: '登录后访问个人中心',
        variant: 'destructive'
      });
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
    }
  }, []);

  // 获取用户信息和发布的文章
  useEffect(() => {
    const fetchUserData = async () => {
      if (!$w.auth.currentUser?.userId) return;
      try {
        // 获取用户信息
        const userResult = await $w.cloud.callDataSource({
          dataSourceName: 'user',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              username: $w.auth.currentUser.name
            }
          }
        });
        if (userResult && userResult.records && userResult.records.length > 0) {
          setUserInfo(userResult.records[0]);
        }

        // 获取用户发布的文章
        let postsResult;
        if (dataSource === 'mysql') {
          postsResult = await $w.cloud.callFunction({
            name: 'mysql-query',
            data: {
              sql: 'SELECT * FROM posts WHERE author_id = ? ORDER BY created_at DESC LIMIT 10',
              params: [$w.auth.currentUser.userId],
              operation: 'query'
            }
          });
          if (postsResult.code === 0) {
            const mysqlPosts = postsResult.data.map(item => ({
              _id: item.id,
              title: item.title,
              content: item.content,
              image: item.image,
              authorId: item.authorId,
              authorName: item.authorName,
              authorAvatar: item.authorAvatar,
              tags: item.tags ? typeof item.tags === 'string' ? item.tags.split(',') : item.tags : [],
              likes: item.likes || 0,
              comments: item.comments || 0,
              views: item.views || 0,
              isPremium: item.isPremium || false,
              publishAt: item.publishAt || item.createdAt || Date.now(),
              status: item.status
            }));
            setUserPosts(mysqlPosts);
          } else {
            throw new Error(postsResult.message);
          }
        } else {
          // 修复orderBy参数格式
          postsResult = await $w.cloud.callDataSource({
            dataSourceName: 'post',
            methodName: 'wedaGetRecordsV2',
            params: {
              filter: {
                authorId: $w.auth.currentUser.userId
              },
              orderBy: 'publishAt desc' // 修复：使用字符串格式 "字段名 排序方向"
            }
          });
          if (postsResult && postsResult.records) {
            setUserPosts(postsResult.records);
          } else {
            throw new Error('获取内容失败');
          }
        }
      } catch (error) {
        console.error('获取用户数据失败:', error);
        // 降级到微搭数据源
        if (dataSource === 'mysql') {
          setDataSource('weda');
          toast({
            title: 'MySQL连接失败',
            description: '已切换到微搭数据源',
            variant: 'destructive'
          });
          // 重新获取数据
          setTimeout(() => {
            fetchUserData();
          }, 1000);
        } else {
          toast({
            title: '网络错误',
            description: '请检查网络连接后重试',
            variant: 'destructive'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();

    // 检查微信绑定状态
    if ($w.auth.currentUser?.userId) {
      setIsWechatBound(!!$w.auth.currentUser?.avatarUrl?.includes('wx.qlogo.cn'));
    }
  }, [$w.auth.currentUser?.userId, dataSource]);
  if (!$w.auth.currentUser?.userId) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>正在跳转登录...</p>
        </div>
      </div>;
  }
  const handleLogout = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      await tcb.auth().signOut();
      await tcb.auth().signInAnonymously();
      await $w.auth.getUserInfo({
        force: true
      });
      toast({
        title: '退出成功',
        description: '期待再次与您相遇！'
      });
      $w.utils.navigateTo({
        pageId: 'home',
        params: {}
      });
    } catch (error) {
      console.error('退出失败:', error);
      toast({
        title: '退出失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const handleEditProfile = async () => {
    try {
      // 更新用户信息
      if (userInfo) {
        await $w.cloud.callDataSource({
          dataSourceName: 'user',
          methodName: 'wedaUpdateV2',
          params: {
            _id: userInfo._id,
            lastLoginAt: new Date().getTime(),
            loginCount: (userInfo.loginCount || 0) + 1
          }
        });
      }
      toast({
        title: '编辑功能',
        description: '个人资料编辑功能开发中...'
      });
    } catch (error) {
      console.error('更新失败:', error);
      toast({
        title: '更新失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const handleWechatBind = async () => {
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
      console.error('绑定失败:', error);
      toast({
        title: '绑定失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const handleUpgradeMembership = () => {
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
  const handleDataBackup = async () => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'sync-data',
        data: {
          action: 'backup',
          tableName: 'user_posts'
        }
      });
      if (result.code === 0) {
        toast({
          title: '数据备份成功',
          description: '用户数据已备份到云储存'
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('数据备份失败:', error);
      toast({
        title: '数据备份失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const user = $w.auth.currentUser;
  const isAdmin = user?.name === 'admin' || user?.type === 'admin';
  const isPremium = userInfo?.isPremium || false;
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 用户信息卡片 */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start space-x-6">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-800 font-playfair">
                  {user?.name || '匿名用户'}
                </h1>
                {isAdmin && <Badge variant="default" className="bg-orange-500">
                    管理员
                  </Badge>}
                {isPremium && <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
                    <Crown className="w-3 h-3 mr-1" />
                    高级会员
                  </Badge>}
                <Button variant="outline" size="sm" onClick={handleEditProfile} className="flex items-center space-x-1">
                  <Edit className="w-3 h-3" />
                  <span>编辑</span>
                </Button>
              </div>
              
              <p className="text-slate-600 mb-4">
                {userInfo?.nickName ? `昵称：${userInfo.nickName}` : '暂无个性签名'}
              </p>
              
              {/* 微信绑定状态 */}
              <div className="flex items-center space-x-4 mb-4">
                {isWechatBound ? <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    <Wechat className="w-3 h-3 mr-1" />
                    微信已绑定
                  </Badge> : <Button variant="outline" size="sm" onClick={handleWechatBind} className="flex items-center space-x-1">
                    <Wechat className="w-3 h-3" />
                    <span>绑定微信</span>
                  </Button>}
                
                {!isPremium && <Button variant="default" size="sm" onClick={handleUpgradeMembership} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                    <Crown className="w-3 h-3 mr-1" />
                    升级会员
                  </Button>}
              </div>
              
              <div className="flex space-x-6 text-sm text-slate-500">
                <div className="text-center">
                  <div className="font-semibold text-slate-800">{userPosts.length}</div>
                  <div>发布内容</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-800">
                    {userPosts.reduce((sum, post) => sum + (post.likes || 0), 0)}
                  </div>
                  <div>获赞数</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-800">
                    {userPosts.reduce((sum, post) => sum + (post.comments || 0), 0)}
                  </div>
                  <div>评论数</div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-1 text-slate-600">
                <LogOut className="w-4 h-4" />
                <span>退出</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 数据源控制 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={toggleDataSource} className="flex items-center space-x-1">
              <Database className="w-3 h-3" />
              <span>{dataSource === 'mysql' ? 'MySQL' : '微搭'}数据源</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDataBackup} className="flex items-center space-x-1">
              <Database className="w-3 h-3" />
              <span>数据备份</span>
            </Button>
          </div>
        </div>

        {/* 选项卡 */}
        <div className="flex space-x-1 bg-slate-100 rounded-lg p-1 mb-6">
          <button onClick={() => setActiveTab('posts')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'posts' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
            我的发布
          </button>
          <button onClick={() => setActiveTab('payment')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'payment' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
            会员中心
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
            云服务设置
          </button>
        </div>

        {/* 我的发布 */}
        {activeTab === 'posts' && <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800">我的发布内容</h2>
              <Button onClick={() => $w.utils.navigateTo({
            pageId: 'publish',
            params: {}
          })} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                发布新内容
              </Button>
            </div>
            
            {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => <Card key={i} className="animate-pulse">
                    <CardContent className="p-0">
                      <div className="h-48 bg-slate-200 rounded-t-lg"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-full"></div>
                        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div> : userPosts.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userPosts.map(post => <Card key={post._id} className="hover:shadow-lg transition-all duration-300 border-0">
                    <CardContent className="p-0 overflow-hidden rounded-lg">
                      <img src={post.image || 'https://picsum.photos/seed/' + post._id + '/400/300.jpg'} alt={post.title} className="w-full h-48 object-cover" />
                      <div className="p-4">
                        <CardTitle className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
                          {post.title}
                        </CardTitle>
                        <p className="text-slate-600 text-sm mb-3 line-clamp-3">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{post.likes || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>{post.comments || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{post.publishAt ? new Date(post.publishAt).toLocaleDateString() : '未知时间'}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div> : <Card className="text-center py-12 border-0 bg-white/60">
                <CardContent>
                  <Settings className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">暂无发布内容</h3>
                  <p className="text-slate-500 mb-4">开始分享你的第一篇文章吧！</p>
                  <Button onClick={() => $w.utils.navigateTo({
              pageId: 'publish',
              params: {}
            })} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    立即发布
                  </Button>
                </CardContent>
              </Card>}
          </div>}

        {/* 会员中心 */}
        {activeTab === 'payment' && <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-800">会员中心</h2>
            
            <Card className="border-0 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      {isPremium ? '高级会员' : '免费用户'}
                    </h3>
                    <p className="text-slate-600">
                      {isPremium ? `您已享受所有高级功能，会员有效期至 ${userInfo?.premiumExpireAt ? new Date(userInfo.premiumExpireAt).toLocaleDateString() : '未知时间'}` : '升级会员享受更多专属权益和功能'}
                    </p>
                  </div>
                  <Button onClick={handleUpgradeMembership} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isPremium ? '续费会员' : '升级会员'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 会员权益 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 bg-white/60">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-slate-800 mb-3">免费用户权益</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      基础内容发布
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      社区互动功能
                    </li>
                    <li className="flex items-center text-slate-400">
                      <XCircle className="w-4 h-4 mr-2" />
                      高清图片上传
                    </li>
                    <li className="flex items-center text-slate-400">
                      <XCircle className="w-4 h-4 mr-2" />
                      专属模板
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-slate-800 mb-3">高级会员权益</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                      所有基础功能
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                      高清图片上传
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                      专属模板库
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                      优先内容审核
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>}

        {/* 云服务设置 */}
        {activeTab === 'settings' && <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-800">云服务设置</h2>
            
            <Card className="border-0 bg-white/60">
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-800 mb-4">数据源配置</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">当前数据源</span>
                    <Badge variant="secondary" className={dataSource === 'mysql' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                      {dataSource === 'mysql' ? 'MySQL' : '微搭数据源'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">云储存状态</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      已启用
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">云托管状态</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      运行中
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/60">
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-800 mb-4">数据管理</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={handleDataBackup} variant="outline" className="justify-start">
                    <Database className="w-4 h-4 mr-2" />
                    数据备份
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Database className="w-4 h-4 mr-2" />
                    数据恢复
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>}
      </div>
    </div>;
}