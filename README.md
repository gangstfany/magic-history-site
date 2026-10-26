# Magic History · Homepage

网站整体框架的唯一提交仓库：`gangstfany/magic-history-site`，日常分支 `main`。

只管理首页视觉、导航、学科入口、加载状态及模块地址。世界史和艺术史在各自仓库独立构建、部署。课程发布不会修改本仓库，也不会触发首页发布。首页不直接访问课程DOM、全局变量或数据文件。

## 应该向哪里提交

| 改动 | 仓库 |
| --- | --- |
| 首页布局、导航、学科入口 | magic-history-site |
| 登录、注册、账号服务 | magic-history-auth |
| 世界史内容、因果链、地图、商路、练习、Today’s Pick数据 | magic-history-apwh |
| 艺术史作品、图像、地图及学习功能 | magic-history-art |

课程地址配置在 `modules.json`，默认加载同一GitHub账号下独立Pages地址。账号依赖在 `auth-release.json` 固定到完整commit：修改账号仓库不会悄悄改变当前首页，需明确更新此版本后才发布新账号组件。账号发布文件在构建时复制到首页自己的域名下，保留原认证会话与回调路径；不假定跨域localStorage共享。

## 本地构建与测试

四个仓库放在同一父目录。账号仓库需checkout到auth-release.json所指定的提交（当前为首次发布提交）。

```sh
node --test tests/*.test.mjs
python3 scripts/build.py
```

跨来源集成预览：`python3 scripts/build.py --local`，然后分别从site/_site、apwh/_site、art/_site在8031、8032、8033端口启动HTTP服务。访问http://127.0.0.1:8031/。--local只更改构建产物，不修改仓库配置。

## 独立部署

本仓库main推送触发自己的Pages工作流；它只读取本仓库与固定版本账号依赖，不checkout课程源码。课程由浏览器从独立发布地址加载。某个课程加载失败只在课程区域显示重试，首页导航仍可用。

Supabase后台需将新首页的完整 `auth-callback.html` 地址加入Redirect URLs白名单；原认证项目及公开浏览器配置未更改。未经实际登录验证，不应假定OAuth新地址已获授权。

原站及旧仓库保留，拆分不会自动切换旧站的Pages来源。新的入口为 https://gangstfany.github.io/magic-history-site/ 。
