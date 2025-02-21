import { useState, useCallback } from "react";
import { useMutation } from "convex/react";

export const useApiMutation = <T, R>(mutationFunction: any) => {
    const [pending, setPending] = useState(false);
    const apiMutation = useMutation(mutationFunction);

    const mutate = useCallback(
        async (payload: T): Promise<R> => {
            setPending(true);
            try {
                return await apiMutation(payload);
            } finally {
                setPending(false);
            }
        },
        [apiMutation]
    );

    return { mutate, pending };
};