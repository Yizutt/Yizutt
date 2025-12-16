
// 获取图文内容列表
exports.main = async (event, context) => {
  const { page = 1, pageSize = 10, authorId } = event;
  
  try {
    // 这里应该调用数据源查询文章
    // 由于当前没有数据模型，暂时返回模拟数据
    const mockPosts = [
      {
        id: '1',
        title: '探索自然之美',
        content: '在大自然的怀抱中，感受生命的奇迹与美好。每一片叶子都在诉说着不同的故事。',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop',
        author: {
          id: 'user1',
          name: '自然探索者',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
        },
        likes: 42,
        comments: 8,
        tags: ['自然', '摄影', '旅行'],
        createdAt: '2024-01-15T10:00:00Z',
        isPremium: false
      },
      {
        id: '2',
        title: '城市夜景摄影技巧',
        content: '掌握长曝光技术，捕捉城市夜晚的璀璨灯光与流动的车轨。',
        image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=500&h=300&fit=crop',
        author: {
          id: 'user2',
          name: '夜景大师',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
        },
        likes: 156,
        comments: 23,
        tags: ['摄影', '技巧', '夜景'],
        createdAt: '2024-01-14T15:30:00Z',
        isPremium: true
      }
    ];
    
    // 过滤作者的文章
    let posts = mockPosts;
    if (authorId) {
      posts = mockPosts.filter(post => post.author.id === authorId);
    }
    
    return {
      code: 0,
      data: {
        records: posts,
        total: posts.length,
        page,
        pageSize
      },
      message: '获取成功'
    };
  } catch (error) {
    return {
      code: -1,
      message: error.message || '获取失败'
    };
  }
};
