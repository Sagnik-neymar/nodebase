import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { Editor, EditorError, EditorLoading } from "@/features/editor/components/editor";
import EditorHeader from "@/features/editor/components/editor-header";




interface Props {
    params: Promise<{
        workflowId: string
    }>
}

const page = async ({ params }: Props) => {
    await requireAuth();

    const { workflowId } = await params;

    prefetchWorkflow(workflowId);    // we dont need to awai this cuz its simply caching the value and not returning anything

    return (
        <HydrateClient>
            <ErrorBoundary fallback={<EditorError />}>
                <Suspense fallback={<EditorLoading />}>
                    <EditorHeader workflowId={workflowId} />
                    <main className="flex-1">
                        <Editor workflowId={workflowId} />
                    </main>
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    )
}

export default page
