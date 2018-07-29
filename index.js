import puppeteer from 'puppeteer';

const DEFAULT_EVENTS = [
  'load',
  'domcontentloaded',
  'networkidle0',
]

export class CodeCoverage {
  constructor(url, {events = DEFAULT_EVENTS, headless = true} = {}) {
    this.options = {
      headless,
    };
    this.url = url;
    this.events = events;
    this.coverageStats = new Map();
  }
  async collectCoverage() {
    const browser = await puppeteer.launch(this.options);
    const coverage = await Promise.all(this.events.map(event => this.collectCoverageFromEvent(browser, event)));
    await browser.close();

    for (const item of coverage) {
      this.getStats('js', item.event, item.jsCoverage);
      this.getStats('css', item.event, item.cssCoverage);
    }

    return this.coverageStats;
  }

  getStats(type, event, coverage) {
    for (const item of coverage) {
      if (!this.coverageStats.has(item.url)) {
        this.coverageStats.set(item.url, []);
      }
      const stat = this.coverageStats.get(item.url);

      let data = stat.find(s => s.event === event);
      if (!data) {
        data = {
          jsUsed: 0,
          jsTotal: 0,
          cssUsed: 0,
          cssTotal: 0,
          event: event,
          url: item.url,
        }
        stat.push(data);
      }
      const used = `${type}Used`;
      const total = `${type}Total`;
      data[total] += item.text.length;
      data.total += item.text.length;

      for (const range of item.ranges) {
        data[used] += range.end - range.start - 1;
      }
    }
  }

  async collectCoverageFromEvent(browser, event) {
    const page = await browser.newPage();
    await Promise.all([
      page.coverage.startJSCoverage(),
      page.coverage.startCSSCoverage()
    ]);
    await page.goto(this.url, {waitUnti: event});
    const [jsCoverage, cssCoverage] = await Promise.all([
      page.coverage.stopJSCoverage(),
      page.coverage.stopCSSCoverage()
    ])
    const data = {
      event: event,
      jsCoverage: jsCoverage, // {url: '', text: '', ranges: [{start, end}]}
      cssCoverage: cssCoverage,
    }

    await page.close();
    return data;
  }

}
