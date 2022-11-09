import { IndexableDocument } from '@backstage/plugin-search-common';

export interface RandomUserDocument extends IndexableDocument {
    id: string,
    email: string;
    firstName: string;
    lastName: string;
}