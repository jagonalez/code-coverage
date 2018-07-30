import React from 'react';
import { shallow } from 'enzyme';

import { Bar } from '../Bar.jsx'

describe('<Bar>', () => {
  const DEFAULT_PROPS = {
    original: {
      jsUsedPercent: "15",
      cssUsedPercent: "25"
    }
  }
  it('should render', () => {
    const wrapper = shallow(<Bar {...DEFAULT_PROPS} />);
    expect(wrapper.exists()).toBe(true);
  });
  it('should set the width for css and js', () => {
    const wrapper = shallow(<Bar {...DEFAULT_PROPS} />);
    const span = wrapper.find('span').at(0);
    expect(span.props().style).toEqual(
      expect.objectContaining({
        width: "15%",
      })
    );
    const span2 = wrapper.find('span').at(2);
    expect(span.props().style).toEqual(
      expect.objectContaining({
        width: "15%",
      })
    );
  });
});