import { useQuery } from '@tanstack/react-query';
import { type User } from '@shared/schema';

export function useUser() {
  // In a real app, we would get the user ID from auth context
  // For demo purposes, we're using a hardcoded user ID
  const userId = 1;
  
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
