// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Users, FileText, BarChart3, Settings } from 'lucide-react';

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

      // 获取统计数据
      const [usersResult, allPostsResult] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          pageSize: 1
        }
      }), $w.cloud.callDataSource({
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
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                待审核: {pendingPosts.length}
              </Badge>
            </div>

            {isLoading ? <div className="space-y-4">
                {[1, 2].map(i => <Card key={i} className="border-0 bg-slate-800/50 animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-slate-700 rounded w-full mb-2"></div>
                      <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                    </CardContent>
                  </Card>)}
              </div> : pendingPosts.length > 0 ? <div className="space-y-4">
                {pendingPosts.map(post => <PendingPostItem key={post._id} post={post} onApprove={handleApprovePost} onReject={handleRejectPost} onPreview={handlePreviewPost} onDelete={handleDeletePost} />)}
              </div> : <Card className="border-0 bg-slate-800/50 text-center py-12">
                <CardContent>
                  <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-200 mb-2">暂无待审核内容</h3>
                  <p className="text-slate-400">所有内容都已审核完毕！</p>
                </CardContent>
              </Card>}
          </div>}

        {/* 其他选项卡内容 */}
        {(activeTab === 'users' || activeTab === 'settings') && <Card className="border-0 bg-slate-800/50">
            <CardContent className="p-8 text-center">
              <Settings className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-200 mb-2">功能开发中</h3>
              <p className="text-slate-400">该功能正在紧张开发中，敬请期待！</p>
            </CardContent>
          </Card>}
      </div>
    </div>;
}