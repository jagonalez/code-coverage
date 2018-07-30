import React from 'react';

import { Search } from './Search.jsx';

export const Container = ({ children }) => (
  <div>
    <Search />
    <hr />
    <div>
      {children}
    </div>
  </div>
);