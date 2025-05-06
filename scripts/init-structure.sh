#!/bin/bash

# Tạo thư mục gốc
mkdir -p runout-biliard

# Server (Backend Node.js/Express)
mkdir -p runout-biliard/server/src/{api,services,data,common,config}
touch runout-biliard/server/src/{app.js,server.js}
mkdir -p runout-biliard/server/tests
touch runout-biliard/server/{.eslintrc.js,.prettierrc,jest.config.js,package.json,README.md}

# Client (Frontend React)
mkdir -p runout-biliard/client/public
mkdir -p runout-biliard/client/src/{assets,components,hooks,pages,services,store,utils,routes}
touch runout-biliard/client/src/{App.js,index.js}
touch runout-biliard/client/{.eslintrc.js,.prettierrc,package.json,README.md}

# Docker files
mkdir -p runout-biliard/docker
touch runout-biliard/docker/{docker-compose.yml,Dockerfile.server,Dockerfile.client}

# GitHub Actions
mkdir -p runout-biliard/.github/workflows
touch runout-biliard/.github/workflows/{ci.yml,deploy.yml}

# Root files
touch runout-biliard/.gitignore
touch runout-biliard/README.md

echo "✅ Cấu trúc thư mục dự án runout-biliard đã được tạo thành công."
