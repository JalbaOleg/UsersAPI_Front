export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number | null;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AuthUser {
  name: string | null;
  email: string | null;
  picture: string | null;
}
