import { request } from "./client";
import type { PagedResult, User } from "../types";

export const usersApi = {
  list: (page: number, pageSize: number) =>
    request<PagedResult<User>>(`/api/users?page=${page}&pageSize=${pageSize}`),
};
