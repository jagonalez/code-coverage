import puppeteer from 'puppeteer';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import fs from 'fs';

import { Container } from './components/Container.jsx';
import { Coverage } from './components/Coverage.jsx';
import { Bar } from './components/Bar.jsx';
import { BarLegend } from './components/BarLegend.jsx';

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

  async writeToFile(file="coverage.html") {
    const html = this.statsToHtml();
    await fs.writeFileSync(`./${file}`, html);
  }
  
  statsToHtml() {
    const columns = [
      {
        Header: 'Page Event',
        accessor: 'event',
      },
      {
        id: 'used',
        Header: BarLegend,
        Cell: Bar,
      },
      {
        id: 'jsUsed',
        Header: 'JS Used',
        accessor: data => `${data.jsUsed}KB (${data.jsUsedPercent}%)`,
      },
      {
        id: 'cssUsed',
        Header: 'CSS Used',
        accessor: data => `${data.cssUsed}KB (${data.cssUsedPercent}%)`,
      },
      {
        id: 'total',
        Header: 'Total bytes used',
        accessor: data => `${data.used}KB / ${data.total}KB (${data.usedPercent}%)`,
      }
    ];
    const data = [];

    for (const [url, stats] of this.coverageStats) {
      const rows = [];
      this.events.forEach(event => {
        const usage = stats.filter(stat => stat.event === event);
        for (const s of usage) {
          rows.push({
            event: s.event,
            jsUsedPercent: ((s.jsUsed / s.total) * 100).toFixed(0),
            jsUsed: (s.jsUsed / 1024).toFixed(2),
            cssUsedPercent: ((s.cssUsed / s.total) * 100).toFixed(0),
            cssUsed: (s.cssUsed / 1024).toFixed(2),
            used: (s.used / 1024).toFixed(2),
            total: (s.total / 1024).toFixed(2),
            usedPercent: ((s.used / s.total) * 100).toFixed(0),
          });
        }
      });
      data.push({
        url,
        rows,
      });
    }

    const props = {
      columns,
      data,
      key: 'coverage',
    };
    const children = [
      React.createElement(Coverage, props),
    ];
    const container = ReactDOMServer.renderToStaticMarkup(
      React.createElement(Container, {children})
    );
    return `
    <html>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/react-table@latest/react-table.css">
      </head>
      <body>
        ${container}
      </body>
    </html>`
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
          total: 0,
          used: 0,
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
        data.used += range.end - range.start - 1;
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
