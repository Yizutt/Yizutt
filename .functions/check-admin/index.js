
// 检查管理员权限
exports.main = async (event, context) => {
  const { userId } = event;
  
  try {
    // 这里应该查询用户权限
    // 暂时模拟管理员检查
    const isAdmin = userId === 'admin' || userId?.includes('admin');
    
    return {
      code: 0,
      data: {
        isAdmin,
        userId
      },
      message: '权限检查成功'
    };
  } catch (error) {
    return {
      code: -1,
      message: error.message || '权限检查失败'
    };
  }
};
