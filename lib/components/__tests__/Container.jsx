import React from 'react';
import { shallow } from 'enzyme';

import { Container } from '../Container.jsx'

describe('<Container>', () => {
  it('should render', () => {
    const wrapper = shallow(<Container />);
    expect(wrapper.exists()).toBe(true);
  });
  it('should render any children', () => {
    const PROPS = {
      children: [<span key={'test'} />]
    }
    const wrapper = shallow(<Container {...PROPS}/>);
    expect(wrapper.find('span').exists()).toBe(true);
  });
});