// 生成随机 ID
export const genId = (length = 32): string => {
  const chars = "abcdef0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 密码哈希
export const hashPassword = async (password: string): Promise<string> => {
  return await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });
};

// 验证密码
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await Bun.password.verify(password, hash);
};
