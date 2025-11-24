#!/bin/bash

# Crowdin Lark 插件打包脚本

echo "📦 开始打包 Crowdin Lark 插件..."
echo ""

# 创建打包目录
PACKAGE_NAME="crowdin-lark-plugin"
PACKAGE_DIR="./$PACKAGE_NAME"

# 清理旧的打包文件
if [ -d "$PACKAGE_DIR" ]; then
    echo "🧹 清理旧的打包文件..."
    rm -rf "$PACKAGE_DIR"
fi

# 创建打包目录
mkdir -p "$PACKAGE_DIR"

# 复制必要文件
echo "📋 复制文件..."
cp index.html "$PACKAGE_DIR/"
cp styles.css "$PACKAGE_DIR/"
cp app.js "$PACKAGE_DIR/"
cp README.md "$PACKAGE_DIR/"

# 创建 ZIP 压缩包
ZIP_NAME="${PACKAGE_NAME}.zip"
if [ -f "$ZIP_NAME" ]; then
    rm "$ZIP_NAME"
fi

echo "🗜️  创建压缩包..."
cd "$PACKAGE_DIR"
zip -r "../$ZIP_NAME" . > /dev/null
cd ..

# 清理临时目录
rm -rf "$PACKAGE_DIR"

echo ""
echo "✅ 打包完成！"
echo ""
echo "📦 打包文件: $ZIP_NAME"
echo "📁 包含文件:"
echo "   - index.html"
echo "   - styles.css"
echo "   - app.js"
echo "   - README.md"
echo ""
echo "📝 下一步："
echo "   1. 将文件部署到可访问的服务器（需要 HTTPS）"
echo "   2. 在 Crowdin 中创建 App，配置入口 URL"
echo "   3. 详细步骤请查看 DEPLOY.md"
echo ""

