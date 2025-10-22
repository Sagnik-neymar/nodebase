import { requireAuth } from "@/lib/auth-utils";




interface Props {
    params: Promise<{
        credentialId: string
    }>
}

const page = async ({ params }: Props) => {
    await requireAuth();
    const { credentialId } = await params;
    
    return (
        <div>
            {credentialId}
        </div>
    )
}

export default page
