import { NotImplementedError } from './errors';

export interface Todo {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly createdAt: Date;
}

export class TodoNotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`Todo not found: ${id}`);
    this.name = 'TodoNotFoundError';
  }
}

export async function listTodos(): Promise<Todo[]> {
  return Promise.reject(new NotImplementedError('listTodos'));
}

export async function createTodo(title: string): Promise<Todo> {
  return Promise.reject(new NotImplementedError(`createTodo(${title})`));
}

export async function toggleTodo(id: string): Promise<Todo> {
  return Promise.reject(new NotImplementedError(`toggleTodo(${id})`));
}
