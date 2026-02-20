(async () => {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  const contexts = [
    { name: "mobile", w: 360, h: 800 },
    { name: "tablet", w: 768, h: 1024 },
    { name: "desktop", w: 1024, h: 768 },
  ];
  const routes = ["/", "/dashboard", "/profile"];

  for (const c of contexts) {
    const context = await browser.newContext({ viewport: { width: c.w, height: c.h } });
    for (const route of routes) {
      const page = await context.newPage();
      try {
        await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle", timeout: 20000 });
        await page.waitForTimeout(500);
        const result = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const nodes = Array.from(document.querySelectorAll("body *"));
          const maxRight = nodes.reduce((acc, el) => {
            const r = el.getBoundingClientRect();
            return Math.max(acc, r.right);
          }, 0);
          return {
            scrollW: doc.scrollWidth,
            innerW: window.innerWidth,
            bodyW: body.scrollWidth,
            maxRight: Math.round(maxRight),
          };
        });

        const overflow =
          result.scrollW > result.innerW + 1 ||
          result.bodyW > result.innerW + 1 ||
          result.maxRight > result.innerW + 1;

        console.log(`${c.name} ${route} status=ok overflow=${overflow} inner=${result.innerW} scroll=${result.scrollW} body=${result.bodyW} maxRight=${result.maxRight}`);
      } catch (e) {
        console.log(`${c.name} ${route} status=error msg=${String(e).slice(0, 140)}`);
      } finally {
        await page.close();
      }
    }
    await context.close();
  }

  await browser.close();
})();
