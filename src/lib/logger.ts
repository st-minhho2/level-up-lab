// §11 logging failures (B1.6). Skeleton: the body is written by the green commit.
import { NotImplementedError } from '@/lib/errors';

export type MutationActionName =
  'createTodoAction' | 'toggleTodoAction' | 'updateTodoTitleAction' | 'clearCompletedTodosAction';

export function logMutationFailure(action: MutationActionName, error: unknown): void {
  throw new NotImplementedError(`logMutationFailure(${action}, ${String(error)})`);
}
