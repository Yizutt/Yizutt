// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Users, FileText, BarChart3, Settings, Eye, Check, X, Trash2, UserPlus, Shield, Database } from 'lucide-react';

// @ts-ignore;
import { AdminStatsCard } from '@/components/AdminStatsCard';
// @ts-ignore;
import { PendingPostItem } from '@/components/PendingPostItem';
// @ts-ignore;
import { AdminHeader } from '@/components/AdminHeader';
export default function Admin(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingPosts, setPendingPosts] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 检查管理员权限
  useEffect(() => {
    const checkAdminPermission = async () => {
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
          setIsAdmin(true);
          fetchAdminData();
        } else {
          toast({
            title: '权限不足',
            description: '该功能仅限管理员访问',
            variant: 'destructive'
          });
          $w.utils.navigateBack();
        }
      } catch (error) {
        console.error('权限检查失败:', error);
        toast({
          title: '权限检查失败',
          description: error.message || '请稍后重试',
          variant: 'destructive'
        });
        $w.utils.navigateBack();
      }
    };
    checkAdminPermission();
  }, []);
  const fetchAdminData = async () => {
    try {
      // 获取待审核文章
      const postsResult = await $w.cloud.callDataSource({
        dataSourceName: 'post',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            status: 'pending'
          },
          orderBy: [{
            field: 'publishAt',
            order: 'desc'
          }]
        }
      });
      if (postsResult && postsResult.records) {
        const pendingPosts = postsResult.records.map(post => ({
          ...post,
          submitTime: new Date(post.publishAt).toLocaleString('zh-CN')
        }));
        setPendingPosts(pendingPosts);
      }

      // 获取用户数据
      const usersResult = await $w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          pageSize: 50
        }
      });
      if (usersResult && usersResult.records) {
        setAllUsers(usersResult.records);
      }

      // 获取统计数据
      const [allPostsResult] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'post',
        methodName: 'wedaGetRecordsV2',
        params: {
          pageSize: 1
        }
      })]);
      const stats = {
        totalUsers: usersResult?.total || 0,
        newUsersToday: Math.floor(Math.random() * 10),
        // 模拟数据
        totalPosts: allPostsResult?.total || 0,
        pendingReviews: pendingPosts.length,
        approvedToday: Math.floor(Math.random() * 20) // 模拟数据
      };
      setUserStats(stats);
    } catch (error) {
      console.error('获取管理员数据失败:', error);
      toast({
        title: '数据获取失败',
        description: '请检查网络连接后重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleApprovePost = async postId => {
    try {
      // 审核通过文章
      await $w.cloud.callDataSource({
        dataSourceName: 'post',
        methodName: 'wedaUpdateV2',
        params: {
          _id: postId,
          status: 'published'
        }
      });
      setPendingPosts(pendingPosts.filter(post => post._id !== postId));
      toast({
        title: '审核通过',
        description: '内容已成功发布'
      });
    } catch (error) {
      console.error('审核失败:', error);
      toast({
        title: '审核失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const handleRejectPost = async postId => {
    try {
      // 拒绝文章
      await $w.cloud.callDataSource({
        dataSourceName: 'post',
        methodName: 'wedaUpdateV2',
        params: {
          _id: postId,
          status: 'rejected'
        }
      });
      setPendingPosts(pendingPosts.filter(post => post._id !== postId));
      toast({
        title: '已拒绝',
        description: '内容已被拒绝发布',
        variant: 'destructive'
      });
    } catch (error) {
      console.error('拒绝失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const handlePreviewPost = postId => {
    toast({
      title: '预览功能',
      description: '内容预览功能开发中...'
    });
  };
  const handleDeletePost = async postId => {
    try {
      // 删除文章
      await $w.cloud.callDataSource({
        dataSourceName: 'post',
        methodName: 'wedaDeleteV2',
        params: {
          _id: postId
        }
      });
      setPendingPosts(pendingPosts.filter(post => post._id !== postId));
      toast({
        title: '删除成功',
        description: '违规内容已被删除'
      });
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const handleBackToHome = () => {
    $w.utils.navigateTo({
      pageId: 'home',
      params: {}
    });
  };
  const handleUpgradeUser = async userId => {
    try {
      // 升级用户为会员
      await $w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaUpdateV2',
        params: {
          _id: userId,
          isPremium: true,
          premiumExpireAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).getTime() // 一年后过期
        }
      });
      toast({
        title: '升级成功',
        description: '用户已升级为高级会员'
      });
      fetchAdminData(); // 刷新数据
    } catch (error) {
      console.error('升级失败:', error);
      toast({
        title: '升级失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const handleSetAdmin = async userId => {
    try {
      // 设置用户为管理员
      await $w.cloud.callDataSource({
        dataSourceName: 'admin_permission',
        methodName: 'wedaCreateV2',
        params: {
          userId: userId,
          isActive: true,
          createdAt: new Date().getTime()
        }
      });
      toast({
        title: '设置成功',
        description: '用户已设置为管理员'
      });
      fetchAdminData(); // 刷新数据
    } catch (error) {
      console.error('设置失败:', error);
      toast({
        title: '设置失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  if (!$w.auth.currentUser?.userId || !isAdmin) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">权限验证中...</p>
        </div>
      </div>;
  }
  const statsCards = [{
    title: '总用户数',
    value: userStats.totalUsers || 0,
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    change: '+12%'
  }, {
    title: '今日新增',
    value: userStats.newUsersToday || 0,
    icon: Users,
    color: 'from-green-500 to-emerald-500',
    change: '+8'
  }, {
    title: '总内容数',
    value: userStats.totalPosts || 0,
    icon: FileText,
    color: 'from-purple-500 to-pink-500',
    change: '+23'
  }, {
    title: '待审核',
    value: userStats.pendingReviews || 0,
    icon: FileText,
    color: 'from-orange-500 to-red-500',
    change: pendingPosts.length
  }];
  const tabs = [{
    id: 'dashboard',
    label: '数据概览',
    icon: BarChart3
  }, {
    id: 'content',
    label: '内容审核',
    icon: FileText
  }, {
    id: 'users',
    label: '用户管理',
    icon: Users
  }, {
    id: 'settings',
    label: '系统设置',
    icon: Settings
  }];
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 text-white">
      <AdminHeader onBackToHome={handleBackToHome} />

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 选项卡导航 */}
        <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1 mb-8">
          {tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>)}
        </div>

        {/* 数据概览 */}
        {activeTab === 'dashboard' && <div className="space-y-6">
            <h2 className="text-2xl font-bold font-playfair">数据概览</h2>
            
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => <AdminStatsCard key={index} {...stat} />)}
            </div>

            {/* 快速操作 */}
            <Card className="border-0 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">快速操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={() => setActiveTab('content')} className="justify-start bg-blue-600 hover:bg-blue-700">
                    <FileText className="w-4 h-4 mr-2" />
                    内容审核
                  </Button>
                  <Button onClick={() => setActiveTab('users')} className="justify-start bg-green-600 hover:bg-green-700">
                    <Users className="w-4 h-4 mr-2" />
                    用户管理
                  </Button>
                  <Button onClick={() => setActiveTab('settings')} className="justify-start bg-purple-600 hover:bg-purple-700">
                    <Settings className="w-4 h-4 mr-2" />
                    系统设置
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>}

        {/* 内容审核 */}
        {activeTab === 'content' && <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-playfair">内容审核</h2>
              <Badge variant="secondary" className="bg-orange-500 text-white">
                {pendingPosts.length} 条待审核
              </Badge>
            </div>
            
            {isLoading ? <div className="space-y-4">
                {[1, 2, 3].map(i => <Card key={i} className="border-0 bg-slate-800/50 backdrop-blur-sm animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-600 rounded w-full mb-2"></div>
                      <div className="h-3 bg-slate-600 rounded w-2/3"></div>
                    </CardContent>
                  </Card>)}
              </div> : pendingPosts.length > 0 ? <div className="space-y-4">
                {pendingPosts.map(post => <PendingPostItem key={post._id} post={post} onApprove={() => handleApprovePost(post._id)} onReject={() => handleRejectPost(post._id)} onPreview={() => handlePreviewPost(post._id)} onDelete={() => handleDeletePost(post._id)} />)}
              </div> : <Card className="border-0 bg-slate-800/50 backdrop-blur-sm text-center py-12">
                <CardContent>
                  <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">暂无待审核内容</h3>
                  <p className="text-slate-500">所有内容都已审核完成</p>
                </CardContent>
              </Card>}
          </div>}

        {/* 用户管理 */}
        {activeTab === 'users' && <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-playfair">用户管理</h2>
              <Badge variant="secondary" className="bg-blue-500 text-white">
                {allUsers.length} 位用户
              </Badge>
            </div>
            
            {isLoading ? <div className="space-y-4">
                {[1, 2, 3].map(i => <Card key={i} className="border-0 bg-slate-800/50 backdrop-blur-sm animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-slate-600 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-slate-600 rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div> : <div className="space-y-4">
                {allUsers.map(user => <Card key={user._id} className="border-0 bg-slate-800/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {user.username?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{user.username || '未知用户'}</h3>
                            <p className="text-slate-400 text-sm">{user.email || '无邮箱'}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {user.isPremium && <Badge variant="secondary" className="bg-yellow-500 text-white">
                                  <Shield className="w-3 h-3 mr-1" />
                                  会员
                                </Badge>}
                              <span className="text-xs text-slate-500">
                                注册时间: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '未知'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!user.isPremium && <Button size="sm" onClick={() => handleUpgradeUser(user._id)} className="bg-yellow-600 hover:bg-yellow-700">
                              <Shield className="w-3 h-3 mr-1" />
                              升级会员
                            </Button>}
                          <Button size="sm" onClick={() => handleSetAdmin(user._id)} className="bg-purple-600 hover:bg-purple-700">
                            <UserPlus className="w-3 h-3 mr-1" />
                            设为管理员
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>}
          </div>}

        {/* 系统设置 */}
        {activeTab === 'settings' && <div className="space-y-6">
            <h2 className="text-2xl font-bold font-playfair">系统设置</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">数据源管理</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">微搭数据源</span>
                    <Badge variant="secondary" className="bg-green-500 text-white">
                      正常
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">MySQL数据库</span>
                    <Badge variant="secondary" className="bg-green-500 text-white">
                      正常
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">云储存</span>
                    <Badge variant="secondary" className="bg-green-500 text-white">
                      正常
                    </Badge>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Database className="w-4 h-4 mr-2" />
                    数据同步
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">系统维护</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    <Settings className="w-4 h-4 mr-2" />
                    清理缓存
                  </Button>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Database className="w-4 h-4 mr-2" />
                    数据备份
                  </Button>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    清理日志
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>}
      </div>
    </div>;
}