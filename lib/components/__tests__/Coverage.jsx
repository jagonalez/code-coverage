import React from 'react';
import { shallow } from 'enzyme';

import { Coverage } from '../Coverage.jsx'

describe('<Coverage>', () => {
  const PROPS = {
    columns: [{Header: 'yup', accessor: 'test'}],
    data: [{url: '1', test: 'ok'}, {url: '2', test: 'no'}]
  }
  it('should render', () => {
    const wrapper = shallow(<Coverage {...PROPS} />);
    expect(wrapper.exists()).toBe(true);
  });
  it('should a react Table for each row', () => {
    const wrapper = shallow(<Coverage {...PROPS} />);
    const Table = wrapper.find('ReactTable')
    expect(Table).toHaveLength(2);
  });
});