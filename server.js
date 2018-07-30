import express from 'express';
import { CodeCoverage } from './lib/coverage';

const app = express();

app.get('/', async (req, res) => {
  let site = '';
  if (req.query.site && req.query.site.indexOf('http://') > -1) {
    site = req.query.site
  }
  const coverage = new CodeCoverage(site);
  if (site !== '') {
    await coverage.collectCoverage();
  }
  res.send(coverage.statsToHtml());
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))