import { requireAuth } from '@/lib/auth-utils'


const page = async () => {
    await requireAuth();
    
    return (
        <div>
            workflows
        </div>
    )
}

export default page
