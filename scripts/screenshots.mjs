// Capture README screenshots by driving the local dev server with Edge.
// Usage: node scripts/screenshots.mjs [baseUrl]
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'fs'

const BASE = process.argv[2] ?? 'http://localhost:5180'
const OUT = new URL('../docs/screenshots/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
mkdirSync(OUT, { recursive: true })

const EDGE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function login(page, email) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' })
  await page.evaluate(() => localStorage.clear())
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' })
  await page.waitForSelector('input[name=email]')
  await page.type('input[name=email]', email)
  await page.type('input[name=password]', 'password')
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
    page.click('button[type=submit]'),
  ])
  await wait(2500) // let Firestore data land
}

async function shot(page, path, file, { full = false } = {}) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle2' })
  await wait(2200)
  await page.screenshot({ path: `${OUT}${file}`, fullPage: full })
  console.log('✓', file)
}

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: [
    '--no-sandbox',
    '--hide-scrollbars',
    '--disable-gpu',
    `--user-data-dir=${process.env.TEMP}\\shiftloggr-pptr-${Date.now()}`,
  ],
})

// ---- Desktop (manager) ----
const desktop = await browser.newPage()
await desktop.setViewport({ width: 1366, height: 800, deviceScaleFactor: 1 })
await desktop.goto(`${BASE}/login`, { waitUntil: 'networkidle2' })
await wait(1200)
await desktop.screenshot({ path: `${OUT}login.png` })
console.log('✓ login.png')

await login(desktop, 'manager@shiftloggr.dev')
await shot(desktop, '/manager', 'manager-dashboard.png')
await shot(desktop, '/manager/schedule', 'manager-schedule.png')
await shot(desktop, '/manager/swaps', 'manager-swaps.png')
await shot(desktop, '/manager/team', 'manager-team.png')
await shot(desktop, '/manager/geofence', 'manager-geofence.png')
await shot(desktop, '/manager/roles', 'manager-roles.png')

// ---- Mobile (employee) ----
const mobile = await browser.newPage()
await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await login(mobile, 'employee@shiftloggr.dev')
await shot(mobile, '/employee', 'employee-myshifts.png')
await shot(mobile, '/employee/clock', 'employee-clockin.png')
await shot(mobile, '/employee/swap', 'employee-swap.png')

await browser.close()
console.log('\nAll screenshots saved to docs/screenshots/')
