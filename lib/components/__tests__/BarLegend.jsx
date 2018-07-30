import React from 'react';
import { shallow } from 'enzyme';

import { BarLegend } from '../BarLegend.jsx'

describe('<BarLegend>', () => {
  it('should render', () => {
    const wrapper = shallow(<BarLegend />);
    expect(wrapper.exists()).toBe(true);
  });
});