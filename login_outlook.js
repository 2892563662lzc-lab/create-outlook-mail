const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const lines = fs.readFileSync('outlook.txt', 'utf8').split('\n').filter(l => l.trim());

    for (const line of lines) {
        const [email, password] = line.split(',');
        if (!email || !password) continue;

        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.goto('https://login.live.com');
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', email, { delay: 100 });
        await page.click('button[type="submit"]');

        await page.waitForSelector('input[type="password"]');
        await page.type('input[type="password"]', password, { delay: 100 });
        await page.click('button[type="submit"]');

        // 跳过"保持登录"提示
        try {
            await page.waitForSelector('#idBtn_Back', { timeout: 5000 });
            await page.click('#idBtn_Back');
        } catch (e) {}

        console.log('已登录:', email);

        // 等待用户手动操作后关闭
        await new Promise(r => setTimeout(r, 30000));
        await browser.close();
    }
})();
