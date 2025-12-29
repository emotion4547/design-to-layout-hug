import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSetting, updateSetting } from '@/services/settings';

export const useSetting = (key: string) => {
  return useQuery({
    queryKey: ['setting', key],
    queryFn: () => getSetting(key),
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      updateSetting(key, value),
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: ['setting', key] });
    },
  });
};
