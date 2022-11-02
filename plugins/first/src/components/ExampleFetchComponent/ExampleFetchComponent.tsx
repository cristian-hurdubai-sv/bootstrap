import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Table, TableColumn, Progress } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import useAsync from 'react-use/lib/useAsync';
import {
  FirstApiOptions,
  FirstApiResult,
  RandomUserItem,
  firstApiRef,
} from '../../api';
import { useApi } from '@backstage/core-plugin-api';

const useStyles = makeStyles({
  avatar: {
    height: 32,
    width: 32,
    borderRadius: '50%',
  },
});

type DenseTableProps = {
  users: RandomUserItem[];
};

const PAGE_SIZE = 30;

export const DenseTable = ({ users }: DenseTableProps) => {
  const classes = useStyles();

  const columns: TableColumn[] = [
    { title: 'Avatar', field: 'avatar' },
    { title: 'Name', field: 'name' },
    { title: 'Email', field: 'email' },
    { title: 'Nationality', field: 'nationality' },
  ];

  const data = users.map(user => {
    return {
      avatar: (
        <img
          src={user.avatar}
          className={classes.avatar}
          alt={user.first_name}
        />
      ),
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      nationality: user.nat,
    };
  });

  return (
    <Table
      title="Database User List"
      options={{
        search: false,
        pageSize: PAGE_SIZE,
        padding: 'dense',
        sorting: true,
        draggable: false,
        paging: true,
        filtering: true,
        debounceInterval: 500,
        filterCellStyle: { padding: '0 16px 0 20px' },
      }}
      columns={columns}
      data={data}
    />
  );
};

export const ExampleFetchComponent = () => {
  const firstApi = useApi(firstApiRef);
  const { value, loading, error } = useAsync(async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const query: any = {};
    // Display the key/value pairs
    for (const [key, value] of searchParams.entries()) {
      query[key] = value;
    }
    let result = {} as FirstApiResult;
    const id = searchParams.get("id") || null;
    if (id) {
      result = await firstApi.getById(id || "");
    } else {
      const page = query?.page ?? 0;
      const pageSize = query?.pageSize ?? PAGE_SIZE;
      result = await firstApi.getAll({
        offset: page * pageSize,
        limit: 10000, // pageSize,
        orderBy:
          query?.orderBy &&
          ({
            field: query.orderBy.field,
            direction: query.orderDirection,
          } as FirstApiOptions['orderBy']),
        filters: query?.filters?.map((filter: { column: { field: any; }; value: any; }) => ({
          field: filter.column.field!,
          value: `*${filter.value}*`,
        })) as FirstApiOptions['filters'],
      });
    }

    return {
      data: result.items as RandomUserItem[],
      totalCount: result.totalCount,
      page: Math.floor(result.offset / result.limit),
    };
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return <DenseTable users={value?.data || []} />;
};
