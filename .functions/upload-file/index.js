
// 云储存文件上传云函数
const cloudbase = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  const { fileData, fileName, fileType } = event;
  
  try {
    // 初始化云开发实例
    const app = cloudbase.init({
      env: context.namespace
    });
    
    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const finalFileName = `${timestamp}_${randomStr}_${fileName}`;
    
    // 上传文件到云储存
    const uploadResult = await app.uploadFile({
      cloudPath: `images/${finalFileName}`,
      fileContent: Buffer.from(fileData, 'base64')
    });
    
    // 获取文件访问URL
    const fileUrl = await app.getTempFileURL({
      fileList: [uploadResult.fileID]
    });
    
    return {
      code: 0,
      data: {
        fileId: uploadResult.fileID,
        fileUrl: fileUrl.fileList[0].tempFileURL,
        fileName: finalFileName
      },
      message: '文件上传成功'
    };
  } catch (error) {
    console.error('文件上传失败:', error);
    return {
      code: -1,
      message: error.message || '文件上传失败'
    };
  }
};
