export type RandomUserRow = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    avatar?: string;
    nat?: string;
    gender: "male" | "female";
    target: string;
}


export type RawUser = {
    gender: string; // "male"
    name: {
      title: string; // "Mr",
      first: string; // "Duane",
      last: string; // "Reed"
    };
    location: {state: string}; // {street: {number: 5060, name: "Hickory Creek Dr"}, city: "Albany", state: "New South Wales",…}
    email: string; // "duane.reed@example.com"
    login: object; // {uuid: "4b785022-9a23-4ab9-8a23-cb3fb43969a9", username: "blackdog796", password: "patch",…}
    dob: object; // {date: "1983-06-22T12:30:23.016Z", age: 37}
    registered: object; // {date: "2006-06-13T18:48:28.037Z", age: 14}
    phone: string; // "07-2154-5651"
    cell: string; // "0405-592-879"
    id: {
      name: string; // "TFN",
      value: string; // "796260432"
    };
    picture: { medium: string }; // {medium: "https://randomuser.me/api/portraits/men/95.jpg",…}
    nat: string; // "AU"
  };

/**
 * Fields that can be used to filter or order RandomUsers items.
 *
 * @public
 */
export type RandomUserFields = 'id' | 'first_name' | 'last_name' | 'email';

export type apiOptions = {
  offset?: number;
  limit?: number;
  orderBy?: {
    field: RandomUserFields;
    direction: 'asc' | 'desc';
  };
  filters?: {
    field: RandomUserFields;
    /** Value to filter by, with '*' used as wildcard */
    value: string;
  }[];
};