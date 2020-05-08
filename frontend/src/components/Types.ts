export interface ITaskBoard {
  [taskBoardId: string]: {
    id: string;
    title: string;
    taskListIds: string[];
  };
}
export interface ITaskList {
  [taskListId: string]: {
    taskBoardId: string;
    id: string;
    title: string;
    taskCardIds: string[];
  };
}
export interface ITaskCard {
  [taskCardId: string]: {
    taskListId: string;
    id: string;
    title: string;
    body: string;
    done: boolean;
  };
}

export type Task = {
  id: number;
  title: string;
  done: boolean;
};

// https://jsonplaceholder.typicode.com/users (Jsonサンプル)
// Generated by https://quicktype.io ('Paste Json as Code')
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}

export interface Geo {
  lat: string;
  lng: string;
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

// 例
export const exampleUsers: User[] = [
  {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'Sincere@april.biz',
    address: {
      street: 'Kulas Light',
      suite: 'Apt. 556',
      city: 'Gwenborough',
      zipcode: '92998-3874',
      geo: {
        lat: '-37.3159',
        lng: '81.1496',
      },
    },
    phone: '1-770-736-8031 x56442',
    website: 'hildegard.org',
    company: {
      name: 'Romaguera-Crona',
      catchPhrase: 'Multi-layered client-server neural-net',
      bs: 'harness real-time e-markets',
    },
  },
];
