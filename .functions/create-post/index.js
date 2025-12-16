
// 创建图文内容
exports.main = async (event, context) => {
  const { title, content, image, tags, authorId } = event;
  
  try {
    // 这里应该调用数据源创建文章
    // 由于当前没有数据模型，暂时返回模拟数据
    const result = {
      id: Date.now().toString(),
      title,
      content,
      image,
      tags,
      authorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return {
      code: 0,
      data: result,
      message: '发布成功'
    };
  } catch (error) {
    return {
      code: -1,
      message: error.message || '发布失败'
    };
  }
};
