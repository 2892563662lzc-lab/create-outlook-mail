# Create Outlook Mail

自动化批量注册 Outlook 邮箱账号的工具，基于 Puppeteer 实现。

## 功能

- `create_outlook.js` — 自动注册 Outlook 账号，结果保存到 `outlook.txt`
- `login_outlook.js` — 自动登录已有 Outlook 账号

## 安装

```bash
npm install
```

## 使用方法

### 1. 注册账号

在 `gmail.txt` 中按以下格式填写姓名和密码（每行一条）：

```
firstName,lastName,password
```

示例：
```
John,Doe,MyPassword123
```

然后运行：

```bash
node create_outlook.js
```

注册成功后，账号信息自动追加到 `outlook.txt`。

遇到验证码时需手动完成，完成后关闭浏览器即可继续。

### 2. 登录账号

`outlook.txt` 格式（每行一条）：

```
email,password
```

运行：

```bash
node login_outlook.js
```

## 依赖

- [puppeteer](https://github.com/puppeteer/puppeteer)
- [puppeteer-extra](https://github.com/berstend/puppeteer-extra)
- [puppeteer-extra-plugin-stealth](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth)

## 注意

- `gmail.txt` 和 `outlook.txt` 包含敏感信息，已加入 `.gitignore`，不会上传到 GitHub
- 需要本地安装 Chrome 浏览器，并在 `create_outlook.js` 中配置正确的 `executablePath`
