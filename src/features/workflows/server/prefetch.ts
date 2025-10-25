import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";


type Input = inferInput<typeof trpc.workflows.getMany>;     // this will automatically infer the query input type

// perfetch all workflows util
export const prefetchWorkflows = (params: Input) => {
    return prefetch(trpc.workflows.getMany.queryOptions(params));
}


// prefetch a single workflow
export const prefetchWorkflow = (id: string) => {
    return prefetch(trpc.workflows.getOne.queryOptions({ id }));
}
