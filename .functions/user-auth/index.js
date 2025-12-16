
// 用户认证云函数
const crypto = require('crypto');
const mysql = require('mysql2/promise');

exports.main = async (event, context) => {
  const { 
    action,
    username,
    password,
    email,
    userId,
    token
  } = event;
  
  try {
    let result;
    
    if (action === 'login') {
      // 用户登录
      result = await loginUser(username, password);
    } else if (action === 'register') {
      // 用户注册
      result = await registerUser(username, password, email);
    } else if (action === 'verify') {
      // 验证token
      result = await verifyToken(token);
    } else if (action === 'reset-password') {
      // 重置密码
      result = await resetPassword(userId, password);
    } else if (action === 'change-password') {
      // 修改密码
      result = await changePassword(userId, password, newPassword);
    }
    
    return {
      code: 0,
      data: result,
      message: '操作成功'
    };
  } catch (error) {
    console.error('用户认证失败:', error);
    return {
      code: -1,
      message: error.message || '用户认证失败',
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

// 用户登录
async function loginUser(username, password) {
  const connection = await getMySQLConnection();
  try {
    // 查询用户
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
    
    if (users.length === 0) {
      throw new Error('用户不存在');
    }
    
    const user = users[0];
    
    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }
    
    // 检查账号状态
    if (user.status !== 'active') {
      throw new Error('账号已被禁用');
    }
    
    // 更新登录信息
    await connection.execute(
      'UPDATE users SET lastLoginAt = ?, loginCount = loginCount + 1 WHERE id = ?',
      [Date.now(), user.id]
    );
    
    // 生成token
    const token = generateToken(user);
    
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        isPremium: user.isPremium,
        premiumExpireAt: user.premiumExpireAt
      },
      token: token
    };
  } finally {
    await connection.end();
  }
}

// 用户注册
async function registerUser(username, password, email) {
  const connection = await getMySQLConnection();
  try {
    // 检查用户名是否已存在
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      throw new Error('用户名或邮箱已存在');
    }
    
    // 加密密码
    const hashedPassword = await hashPassword(password);
    
    // 创建用户
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const currentTime = Date.now();
    
    await connection.execute(
      `INSERT INTO users (id, username, email, password, nickName, isPremium, status, loginCount, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, username, email, hashedPassword, username, false, 'active', 0, currentTime, currentTime]
    );
    
    // 生成token
    const user = { id: userId, username, email, nickName: username };
    const token = generateToken(user);
    
    return {
      user: {
        id: userId,
        username: username,
        email: email,
        nickName: username,
        isPremium: false
      },
      token: token
    };
  } finally {
    await connection.end();
  }
}

// 验证token
async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return { valid: true, user: decoded };
  } catch (error) {
    return { valid: false, error: 'Token无效' };
  }
}

// 重置密码
async function resetPassword(userId, newPassword) {
  const connection = await getMySQLConnection();
  try {
    const hashedPassword = await hashPassword(newPassword);
    
    await connection.execute(
      'UPDATE users SET password = ?, updatedAt = ? WHERE id = ?',
      [hashedPassword, Date.now(), userId]
    );
    
    return { success: true };
  } finally {
    await connection.end();
  }
}

// 修改密码
async function changePassword(userId, oldPassword, newPassword) {
  const connection = await getMySQLConnection();
  try {
    // 验证旧密码
    const [users] = await connection.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      throw new Error('用户不存在');
    }
    
    const isOldPasswordValid = await verifyPassword(oldPassword, users[0].password);
    if (!isOldPasswordValid) {
      throw new Error('原密码错误');
    }
    
    // 更新密码
    const hashedNewPassword = await hashPassword(newPassword);
    await connection.execute(
      'UPDATE users SET password = ?, updatedAt = ? WHERE id = ?',
      [hashedNewPassword, Date.now(), userId]
    );
    
    return { success: true };
  } finally {
    await connection.end();
  }
}

// 生成token
function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
  };
  
  // 这里应该使用jwt库，简化版本
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// 加密密码
async function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 验证密码
async function verifyPassword(password, hashedPassword) {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  return hash === hashedPassword;
}
