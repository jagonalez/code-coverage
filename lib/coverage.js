import puppeteer from 'puppeteer';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import fs from 'fs';

import Page from './components/page.js';

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
  async writeToFile() {
    const html = `
    <html>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/react-table@latest/react-table.css">
      </head>
      <body>
        ${this.statsToHtml()}
      </body>
    </html>`
    await fs.writeFileSync("./coverage.html", html);
  }
  statsToHtml() {
    const columns = [
      {
        Header: 'Page Event',
        accessor: 'event',
      },
      {
        id: 'used',
        Header: 'Used',
        accessor: data => data.jsUsed + data.cssUsed,
      },
      {
        Header: 'JS Used',
        accessor: 'jsUsed',
      },
      {
        Header: 'CSS Used',
        accessor: 'cssUsed',
      },
      {
        id: 'total',
        Header: 'Total bytes used',
        accessor: data => data.jsTotal + data.cssTotal,
      }
    ];
    const data = [];

    for (const [url, stats] of this.coverageStats) {
      const rows = [];
      this.events.forEach(event => {
        const usage = stats.filter(stat => stat.event === event);
        for (const s of usage) {
          rows.push(s)
        }
      });
      data.push({
        url,
        rows,
      });
      console.log(data[data.length -1].url)
    }

    const props = {
      columns,
      data,
    }
    return ReactDOMServer.renderToStaticMarkup(
      React.createElement(Page, props)
    )
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
