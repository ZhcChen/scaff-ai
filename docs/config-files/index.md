# 配置文件模板

> 项目常用配置文件的标准模板。

---

## 一、package.json 模板

### 1.1 Monorepo 根配置

```json
{
  "name": "project-name",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "api",
    "web-*",
    "tests/*"
  ],
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "dev:api": "npm --workspace @project/api run dev",
    "dev:web": "npm --workspace @project/web run dev",
    "build:api": "npm --workspace @project/api run build",
    "build:web": "npm --workspace @project/web run build",
    "test": "npm run test:unit && npm run test:e2e",
    "test:unit": "npm --workspace @project/api run test:unit",
    "test:e2e": "npm --workspace @project/e2e run test",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```

### 1.2 API 服务配置

```json
{
  "name": "@project/api",
  "version": "0.1.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "NODE_ENV=production node src/server.js",
    "test:unit": "node --test --test-concurrency=1 tests/**/*.test.js"
  },
  "dependencies": {
    "@hapi/boom": "^10.0.0",
    "@hapi/hapi": "^21.3.0",
    "bcrypt": "^5.1.0",
    "dotenv": "^16.4.0",
    "joi": "^17.11.0",
    "mysql2": "^3.12.0",
    "redis": "^4.6.0",
    "sequelize": "^6.37.0"
  },
  "devDependencies": {
    "eslint": "^9.0.0"
  }
}
```

### 1.3 前端应用配置

```json
{
  "name": "@project/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  "dependencies": {
    "antd": "^5.0.0",
    "dayjs": "^1.11.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^7.0.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^9.0.0",
    "typescript": "^5.5.0",
    "vite": "^6.0.0"
  }
}
```

---

## 二、环境变量模板

### 2.1 .env.example

```bash
# ============ 应用配置 ============
NODE_ENV=development
PORT=3090

# ============ 数据库配置 ============
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=project_dev

# ============ Redis 配置 ============
REDIS_URL=redis://127.0.0.1:6379
# 或带密码：redis://:password@127.0.0.1:6379

# ============ 会话配置 ============
SESSION_SECRET=change-me-in-production
SESSION_TTL_SECONDS=7200

# ============ 数据库迁移 ============
# 设为 0 禁用自动迁移
DB_MIGRATE_AUTO=1

# ============ 日志配置 ============
LOG_LEVEL=debug
REQUEST_LOG_ENABLED=1
REQUEST_LOG_RETENTION_DAYS=7

# ============ 安全配置 ============
# 内部接口鉴权密钥
INTERNAL_API_SECRET=change-me

# ============ 第三方服务 ============
# SMS_API_KEY=
# EMAIL_API_KEY=
```

### 2.2 前端 .env

```bash
# .env.development
VITE_API_BASE=http://localhost:3090
VITE_APP_TITLE=项目名称（开发）

# .env.production
VITE_API_BASE=
VITE_APP_TITLE=项目名称
```

---

## 三、Vite 配置模板

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    host: '0.0.0.0',
    // 允许访问上级目录（共享组件）
    fs: {
      allow: ['..'],
    },
    // API 代理
    proxy: {
      '/api': {
        target: 'http://localhost:3090',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    // 分包策略
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd', '@ant-design/icons'],
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../web-shared/src'),
    },
  },
});
```

---

## 四、TypeScript 配置模板

### 4.1 tsconfig.json（前端）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@shared/*": ["../web-shared/src/*"]
    }
  },
  "include": ["src"]
}
```

### 4.2 tsconfig.json（Node.js）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 五、ESLint 配置模板

### 5.1 ESLint 9+ (Flat Config)

```javascript
// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',

      // React
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // 通用
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.config.js'],
  },
];
```

---

## 六、Prettier 配置模板

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## 七、Git 配置模板

### 7.1 .gitignore

```gitignore
# 依赖
node_modules/
.pnpm-store/

# 构建产物
dist/
build/
*.tsbuildinfo

# 环境变量
.env
.env.local
.env.*.local

# 日志
logs/
*.log
npm-debug.log*

# 编辑器
.vscode/*
!.vscode/extensions.json
.idea/
*.swp
*.swo

# 系统文件
.DS_Store
Thumbs.db

# 测试
coverage/
.nyc_output/

# 临时文件
tmp/
temp/
*.tmp
```

### 7.2 .gitattributes

```
* text=auto eol=lf
*.{cmd,[cC][mM][dD]} text eol=crlf
*.{bat,[bB][aA][tT]} text eol=crlf
```

---

## 八、Docker 配置模板

### 8.1 docker-compose.yml（开发环境）

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: project-mysql
    ports:
      - "23306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: project_dev
      MYSQL_USER: project
      MYSQL_PASSWORD: project123
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/init:/docker-entrypoint-initdb.d
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

  redis:
    image: redis:7-alpine
    container_name: project-redis
    ports:
      - "26379:6379"
    command: redis-server --requirepass redis123
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

### 8.2 Dockerfile（API 服务）

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
EXPOSE 3090

CMD ["node", "src/server.js"]
```

### 8.3 Dockerfile（前端）

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 九、EditorConfig

```ini
# .editorconfig
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
```

---

## 十、VSCode 配置

### 10.1 .vscode/settings.json

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.eol": "\n"
}
```

### 10.2 .vscode/extensions.json

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```
