import { requireAuth } from "@/lib/auth-utils";




interface Props {
    params: Promise<{
        executionId: string
    }>
}

const page = async ({ params }: Props) => {
    await requireAuth();
    const { executionId } = await params;

    return (
        <div>
            {executionId}
        </div>
    )
}

export default page
