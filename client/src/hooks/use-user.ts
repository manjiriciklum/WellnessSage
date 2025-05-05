import { useQuery } from '@tanstack/react-query';
import { type User } from '@shared/schema';
import { useAuth } from './use-auth';

export function useUser() {
  const { user: authUser } = useAuth();
  const userId = authUser?.id;
  
  const {
    data: user,
    isLoading,
    error
  } = useQuery<User>({
    queryKey: [`/api/users/${userId}/profile`],
  });
  
  return {
    user,
    isLoading,
    error
  };
}
