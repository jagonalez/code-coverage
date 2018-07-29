import React from 'react';
import ReactTable from 'react-table';

export default ({ columns, data }) => (
  <div>
    {data.map((d, index) => (
      <div key={index}>
        <h2>{d.url}</h2>
        <ReactTable
          showPagination={false}
          defaultPageSize={3}
          columns={columns}
          data={d.rows}
        />
      </div>
      )
    )}
  </div>
);