
// 数据同步云函数（微搭数据源 <-> MySQL）
const mysql = require('mysql2/promise');

exports.main = async (event, context) => {
  const { 
    action, 
    tableName, 
    data,
    condition,
    syncDirection = 'weda-to-mysql' // weda-to-mysql 或 mysql-to-weda
  } = event;
  
  try {
    let result;
    
    if (action === 'syncToMySQL') {
      // 从微搭数据源同步到MySQL
      result = await syncToMySQL(tableName, data);
    } else if (action === 'syncFromMySQL') {
      // 从MySQL同步到微搭数据源
      result = await syncFromMySQL(tableName, condition);
    } else if (action === 'backup') {
      // 数据备份
      result = await backupData(tableName);
    } else if (action === 'fullSync') {
      // 完整双向同步
      result = await fullSync(tableName);
    } else if (action === 'createTables') {
      // 创建MySQL表结构
      result = await createMySQLTables();
    }
    
    return {
      code: 0,
      data: result,
      message: '数据同步成功'
    };
  } catch (error) {
    console.error('数据同步失败:', error);
    return {
      code: -1,
      message: error.message || '数据同步失败',
      error: error.code
    };
  }
};

// MySQL连接配置
async function getMySQLConnection() {
  return await mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-n4olx0dy.sql.tencentcdb.com',
    port: 21194,
    user: 'root',
    password: 'yizutt-2gyxyqzs7b4b88a2',
    database: 'yizutt-2gyxyqzs7b4b88a2',
    charset: 'utf8mb4',
    ssl: {
      rejectUnauthorized: false
    }
  });
}

// 同步到MySQL
async function syncToMySQL(tableName, data) {
  const connection = await getMySQLConnection();
  try {
    let syncedCount = 0;
    
    if (Array.isArray(data)) {
      for (const item of data) {
        const mysqlData = transformWedaToMySQL(tableName, item);
        const [result] = await connection.execute(
          `INSERT INTO ${tableName} SET ? ON DUPLICATE KEY UPDATE ?`,
          [mysqlData, mysqlData]
        );
        syncedCount += result.affectedRows;
      }
    }
    
    return { 
      synced: true, 
      count: syncedCount,
      tableName: tableName
    };
  } finally {
    await connection.end();
  }
}

// 从MySQL同步
async function syncFromMySQL(tableName, condition) {
  const connection = await getMySQLConnection();
  try {
    let sql = `SELECT * FROM ${tableName}`;
    let params = [];
    
    if (condition) {
      sql += ' WHERE ?';
      params.push(condition);
    }
    
    const [rows] = await connection.execute(sql, params);
    
    return { 
      synced: true, 
      count: rows.length,
      data: rows,
      tableName: tableName
    };
  } finally {
    await connection.end();
  }
}

// 数据备份
async function backupData(tableName) {
  const connection = await getMySQLConnection();
  try {
    const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
    
    // 这里可以将数据备份到云储存
    const backupData = {
      tableName: tableName,
      timestamp: new Date().toISOString(),
      recordCount: rows.length,
      data: rows
    };
    
    return { 
      backup: true, 
      timestamp: backupData.timestamp,
      recordCount: rows.length,
      tableName: tableName
    };
  } finally {
    await connection.end();
  }
}

// 完整双向同步
async function fullSync(tableName) {
  const mysqlResult = await syncFromMySQL(tableName);
  // 这里需要调用微搭API获取数据并同步到MySQL
  // 由于云函数限制，这里只返回MySQL数据
  
  return {
    fullSync: true,
    mysqlData: mysqlResult,
    tableName: tableName
  };
}

// 创建MySQL表结构
async function createMySQLTables() {
  const connection = await getMySQLConnection();
  try {
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255),
        password VARCHAR(255),
        nickName VARCHAR(100),
        avatarUrl TEXT,
        wechatOpenId VARCHAR(100),
        isPremium BOOLEAN DEFAULT FALSE,
        premiumExpireAt BIGINT,
        userType VARCHAR(50),
        lastLoginAt BIGINT,
        loginCount INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        phone VARCHAR(20),
        createdAt BIGINT,
        updatedAt BIGINT
      )`,
      `CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        image TEXT,
        authorId VARCHAR(50),
        authorName VARCHAR(100),
        authorAvatar TEXT,
        tags JSON,
        likes INT DEFAULT 0,
        comments INT DEFAULT 0,
        views INT DEFAULT 0,
        isPremium BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'pending',
        publishAt BIGINT,
        category VARCHAR(100),
        summary TEXT,
        createdAt BIGINT,
        updatedAt BIGINT
      )`,
      `CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(50) PRIMARY KEY,
        userId VARCHAR(50),
        planId VARCHAR(50),
        planName VARCHAR(100),
        amount DECIMAL(10,2),
        paymentMethod VARCHAR(50),
        transactionId VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        paidAt BIGINT,
        expireAt BIGINT,
        description TEXT,
        period VARCHAR(50),
        createdAt BIGINT,
        updatedAt BIGINT
      )`,
      `CREATE TABLE IF NOT EXISTS admin_permissions (
        id VARCHAR(50) PRIMARY KEY,
        userId VARCHAR(50),
        username VARCHAR(100),
        role VARCHAR(50),
        permissions JSON,
        isActive BOOLEAN DEFAULT TRUE,
        lastLoginAt BIGINT,
        loginIp VARCHAR(50),
        createdBy VARCHAR(50),
        createdAt BIGINT,
        updatedAt BIGINT
      )`,
      `CREATE TABLE IF NOT EXISTS plans (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2),
        period VARCHAR(50),
        features JSON,
        isPopular BOOLEAN DEFAULT FALSE,
        isActive BOOLEAN DEFAULT TRUE,
        sortOrder INT DEFAULT 0,
        discount DECIMAL(5,2),
        originalPrice DECIMAL(10,2),
        createdAt BIGINT,
        updatedAt BIGINT
      )`
    ];
    
    const results = [];
    for (const sql of tables) {
      await connection.execute(sql);
      results.push(sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1]);
    }
    
    return {
      created: true,
      tables: results
    };
  } finally {
    await connection.end();
  }
}

// 数据转换：微搭格式转MySQL格式
function transformWedaToMySQL(tableName, wedaData) {
  const transformed = { ...wedaData };
  
  // 转换字段名
  if (tableName === 'posts') {
    transformed.id = wedaData._id;
    transformed.created_at = wedaData.publishAt || wedaData.createdAt;
    if (wedaData.tags && Array.isArray(wedaData.tags)) {
      transformed.tags = JSON.stringify(wedaData.tags);
    }
  }
  
  if (tableName === 'users') {
    transformed.id = wedaData._id;
    transformed.created_at = wedaData.createdAt;
    transformed.updated_at = wedaData.updatedAt || wedaData.lastLoginAt;
  }
  
  return transformed;
}
