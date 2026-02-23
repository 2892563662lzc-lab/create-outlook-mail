const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const firstLine = fs.readFileSync('gmail.txt', 'utf8')
        .split(/\r?\n/)
        .find(line => line.trim());

    if (!firstLine) {
        throw new Error('gmail.txt 没有可用数据');
    }

    const [firstName, lastName, password] = firstLine.split(',');
    if (!firstName || !lastName || !password) {
        throw new Error('gmail.txt 第一行格式应为: firstName,lastName,password');
    }

    const birthYear = String(Math.floor(Math.random() * 12) + 1988); // 1988-1999
    const birthMonth = String(Math.floor(Math.random() * 12) + 1);   // 1-12
    const birthDay = String(Math.floor(Math.random() * 28) + 1);     // 1-28
  const randSuffix = Math.floor(Math.random() * 90000 + 1000); // 3-4位短数字
const email = firstName.toLowerCase() + lastName.toLowerCase() + randSuffix + '@outlook.com';

const browser = await puppeteer.launch({ 
        headless: false,
        // 这里换成了你电脑上真实的 Chrome 路径（注意双斜杠）
        executablePath: 'C:\\Users\\28925\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe', 
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled' // 抹除自动化特征
        ]
    });
    const page = await browser.newPage();
    await page.goto('https://signup.live.com/signup', { waitUntil: 'domcontentloaded' });

    const primaryButtonSelector = 'button[data-testid="primaryButton"]';

    const clearAndType = async (selector, value) => {
        await page.waitForSelector(selector, { visible: true, timeout: 30000 });
        await page.click(selector, { clickCount: 3 });
        await page.keyboard.press('Backspace');
        await page.type(selector, value, { delay: 80 });
    };

    const clickPrimary = async () => {
        await page.waitForSelector(primaryButtonSelector, { visible: true, timeout: 30000 });
        await page.click(primaryButtonSelector);
    };

    const pickOptionByIndexFromCombobox = async (buttonSelector, zeroBasedIndex) => {
        await page.waitForSelector(buttonSelector, { visible: true, timeout: 30000 });
        await page.click(buttonSelector);
        await sleep(300);

        await page.waitForSelector('[role="option"]', { visible: true, timeout: 30000 });
        const clicked = await page.evaluate((index) => {
            const visible = (el) => {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
            };
            const visibleOptions = Array.from(document.querySelectorAll('[role="option"]')).filter(visible);
            const target = visibleOptions[index];
            if (!target) return false;
            target.click();
            return true;
        }, zeroBasedIndex);
        if (!clicked) {
            throw new Error(`${buttonSelector} 选项不足，索引 ${zeroBasedIndex} 不存在`);
        }
        await sleep(300);
    };

    // 1) 邮箱
    await clearAndType('input[type="email"]', email);
    await clickPrimary();

    // 2) 密码
    await clearAndType('input[type="password"]', password);
    await clickPrimary();

    fs.appendFileSync('outlook.txt', `${email},${password}\n`);
    console.log('账号密码已保存:', email);

    // 3) 出生日期（修复年份输入竞态 + combobox 选择）
    await page.waitForSelector('input[name="BirthYear"]', { visible: true, timeout: 30000 });
    await page.click('input[name="BirthYear"]', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('input[name="BirthYear"]', birthYear);
    await sleep(500);

    await pickOptionByIndexFromCombobox('button[name="BirthMonth"][role="combobox"]', parseInt(birthMonth, 10) - 1);
    await pickOptionByIndexFromCombobox('button[name="BirthDay"][role="combobox"]', parseInt(birthDay, 10) - 1);
    await sleep(500);
    await clickPrimary();
    console.log(`生日已自动提交: ${birthYear}-${birthMonth}-${birthDay}`);

    // 4) 姓名（生日之后）
    await clearAndType('input[name="lastNameInput"]', lastName);
    await clearAndType('input[name="firstNameInput"]', firstName);
    await clickPrimary();
    console.log('姓名已自动提交');

    console.log('自动流程已停止：请手动完成机器人验证。');
    console.log('完成后可直接关闭浏览器窗口。');

    await new Promise(resolve => browser.once('disconnected', resolve));
})().catch(err => {
    console.error('创建 Outlook 账号流程失败:', err.message || err);
});
