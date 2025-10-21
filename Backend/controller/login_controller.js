export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usersData = await executeMysqlQuery(`
      SELECT u.*, GROUP_CONCAT(r.role_name) as roles 
      FROM users u 
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id 
      LEFT JOIN roles r ON ur.role_id = r.role_id 
      WHERE u.email = ? 
      GROUP BY u.user_id
    `, [email]);

    if (usersData.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    const userData = usersData[0];
    const user = new User({
      ...userData,
      roles: userData.roles ? userData.roles.split(',') : []
    });

    // ✅ FIXED: Kiểm tra cả 2 trường hợp có password_hash hoặc password thường
    const isValidPassword = user.password_hash
      ? await bcrypt.compare(password, user.password_hash)
      : password === user.password;

    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        email: user.email,
        roles: user.roles
      },
      process.env.JWT_SECRET || "my_secret_key",
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone_number: user.phone_number,
        avatar_url: user.avatar_url,
        roles: user.roles,
        is_verified: user.is_verified
      }
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ 
      error: 'Login failed',
      message: error.message 
    });
  }
};
