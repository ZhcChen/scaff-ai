-- 初始化数据库 schema
-- 运行: mysql -u root -p < sql/seeds/init.sql

-- 创建数据库
CREATE DATABASE IF NOT EXISTS scaff_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE scaff_ai;

-- 用户表
CREATE TABLE IF NOT EXISTS auth_user (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(64) NOT NULL DEFAULT '',
  email VARCHAR(128),
  avatar VARCHAR(255),
  status TINYINT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 角色表
CREATE TABLE IF NOT EXISTS auth_role (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(64) NOT NULL,
  description VARCHAR(255),
  status TINYINT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 权限表
CREATE TABLE IF NOT EXISTS auth_permission (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(64) NOT NULL,
  resource VARCHAR(32) NOT NULL,
  action VARCHAR(32) NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户角色关联
CREATE TABLE IF NOT EXISTS auth_user_role (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_role (user_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 角色权限关联
CREATE TABLE IF NOT EXISTS auth_role_permission (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_role_permission (role_id, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 系统配置表
CREATE TABLE IF NOT EXISTS sys_config (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(64) NOT NULL UNIQUE,
  value TEXT,
  description VARCHAR(255),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 操作日志表
CREATE TABLE IF NOT EXISTS sys_operation_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  username VARCHAR(64),
  action VARCHAR(64) NOT NULL,
  resource VARCHAR(64),
  resource_id VARCHAR(64),
  detail TEXT,
  ip VARCHAR(64),
  user_agent VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 请求日志表
CREATE TABLE IF NOT EXISTS sys_request_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trace_id VARCHAR(64) NOT NULL,
  method VARCHAR(10) NOT NULL,
  path VARCHAR(255) NOT NULL,
  status_code INT NOT NULL,
  duration_ms INT NOT NULL,
  user_id BIGINT UNSIGNED,
  ip VARCHAR(64),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== 初始数据 ====================

-- 超级管理员 (密码: admin123)
INSERT INTO auth_user (id, username, password_hash, display_name) VALUES
(1, 'admin', '$2b$10$71oWeikh80fFq06p56q2SeUK6nyQYHriRJAfLVXNkCxuhhmnhDL.K', '超级管理员')
ON DUPLICATE KEY UPDATE id=id;

-- 基础权限
INSERT INTO auth_permission (code, name, resource, action) VALUES
('user:list', '查看用户列表', 'user', 'list'),
('user:create', '创建用户', 'user', 'create'),
('user:update', '更新用户', 'user', 'update'),
('user:delete', '删除用户', 'user', 'delete'),
('role:list', '查看角色列表', 'role', 'list'),
('role:create', '创建角色', 'role', 'create'),
('role:update', '更新角色', 'role', 'update'),
('role:delete', '删除角色', 'role', 'delete'),
('permission:list', '查看权限列表', 'permission', 'list'),
('config:list', '查看系统配置', 'config', 'list'),
('config:update', '更新系统配置', 'config', 'update'),
('log:list', '查看日志', 'log', 'list')
ON DUPLICATE KEY UPDATE code=code;

-- 管理员角色
INSERT INTO auth_role (code, name, description) VALUES
('admin', '管理员', '系统管理员')
ON DUPLICATE KEY UPDATE code=code;
