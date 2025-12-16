
// MySQL数据库查询云函数
const mysql = require('mysql2/promise');

exports.main = async (event, context) => {
  const { 
    sql, 
    params = [],
    operation = 'query'
  } = event;
  
  try {
    // MySQL连接配置（需要配置环境变量）
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'sh-cynosdbmysql-grp-n4olx0dy.sql.tencentcdb.com',
      port: process.env.MYSQL_PORT || 21194,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB || 'yizutt-2gyxyqzs7b4b88a2',
      charset: 'utf8mb4'
    });
    
    let result;
    
    if (operation === 'query') {
      // 查询操作
      const [rows] = await connection.execute(sql, params);
      result = rows;
    } else if (operation === 'execute') {
      // 执行操作（增删改）
      const [resultSet] = await connection.execute(sql, params);
      result = resultSet;
    }
    
    await connection.end();
    
    return {
      code: 0,
      data: result,
      message: '数据库操作成功'
    };
  } catch (error) {
    console.error('数据库操作失败:', error);
    return {
      code: -1,
      message: error.message || '数据库操作失败'
    };
  }
};
