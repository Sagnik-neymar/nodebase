import { caller, trpc } from "@/trpc/server"
import { getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Client_test from "../test_client";

const page = async () => {
    const queryClient = getQueryClient();

    // prefetching
    void queryClient.prefetchQuery(trpc.getUsers.queryOptions());

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Client_test />
        </HydrationBoundary>
    )
}

export default page
