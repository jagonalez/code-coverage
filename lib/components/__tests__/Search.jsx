import React from 'react';
import { shallow } from 'enzyme';

import { Search } from '../Search.jsx'

describe('<Search>', () => {
  it('should render', () => {
    const wrapper = shallow(<Search />);
    expect(wrapper.exists()).toBe(true);
  });
});