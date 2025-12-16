
// 云储存文件上传云函数
const cloudbase = require('@cloudbase/node-sdk');
const crypto = require('crypto');

exports.main = async (event, context) => {
  const { fileData, fileName, fileType, folder = 'images' } = event;
  
  try {
    // 初始化云开发实例
    const app = cloudbase.init({
      env: context.namespace
    });
    
    // 验证文件数据
    if (!fileData || !fileName) {
      throw new Error('文件数据或文件名不能为空');
    }
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (fileType && !allowedTypes.includes(fileType)) {
      throw new Error('不支持的文件类型');
    }
    
    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileExt = fileName.split('.').pop();
    const finalFileName = `${timestamp}_${randomStr}.${fileExt}`;
    const cloudPath = `${folder}/${finalFileName}`;
    
    // 解码base64数据
    let buffer;
    try {
      buffer = Buffer.from(fileData, 'base64');
    } catch (error) {
      throw new Error('文件数据格式错误');
    }
    
    // 检查文件大小（限制10MB）
    if (buffer.length > 10 * 1024 * 1024) {
      throw new Error('文件大小不能超过10MB');
    }
    
    // 上传文件到云储存
    const uploadResult = await app.uploadFile({
      cloudPath: cloudPath,
      fileContent: buffer
    });
    
    // 获取文件访问URL
    const fileUrl = await app.getTempFileURL({
      fileList: [uploadResult.fileID]
    });
    
    // 生成文件哈希（用于验证）
    const fileHash = crypto.createHash('md5').update(buffer).digest('hex');
    
    return {
      code: 0,
      data: {
        fileId: uploadResult.fileID,
        fileUrl: fileUrl.fileList[0].tempFileURL,
        fileName: finalFileName,
        originalName: fileName,
        fileSize: buffer.length,
        fileType: fileType,
        fileHash: fileHash,
        uploadTime: new Date().toISOString()
      },
      message: '文件上传成功'
    };
  } catch (error) {
    console.error('文件上传失败:', error);
    return {
      code: -1,
      message: error.message || '文件上传失败',
      error: error.code
    };
  }
};
