
// MySQL数据库查询云函数
const mysql = require('mysql2/promise');

exports.main = async (event, context) => {
  const { 
    sql, 
    params = [],
    operation = 'query'
  } = event;
  
  try {
    // MySQL连接配置 - 使用提供的连接信息
    const connection = await mysql.createConnection({
      host: 'sh-cynosdbmysql-grp-n4olx0dy.sql.tencentcdb.com',
      port: 21194,
      user: 'root',
      password: 'yizutt-2gyxyqzs7b4b88a2',
      database: 'yizutt-2gyxyqzs7b4b88a2',
      charset: 'utf8mb4',
      ssl: {
        rejectUnauthorized: false // 腾讯云CynosDB需要SSL
      },
      connectTimeout: 10000,
      acquireTimeout: 10000
    });
    
    let result;
    
    if (operation === 'query') {
      // 查询操作
      const [rows] = await connection.execute(sql, params);
      result = rows;
    } else if (operation === 'execute') {
      // 执行操作（增删改）
      const [resultSet] = await connection.execute(sql, params);
      result = {
        affectedRows: resultSet.affectedRows,
        insertId: resultSet.insertId,
        changedRows: resultSet.changedRows
      };
    } else if (operation === 'transaction') {
      // 事务操作
      await connection.beginTransaction();
      try {
        const results = [];
        for (const query of event.queries) {
          const [rows] = await connection.execute(query.sql, query.params || []);
          results.push(rows);
        }
        await connection.commit();
        result = results;
      } catch (error) {
        await connection.rollback();
        throw error;
      }
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
      message: error.message || '数据库操作失败',
      error: error.code
    };
  }
};
