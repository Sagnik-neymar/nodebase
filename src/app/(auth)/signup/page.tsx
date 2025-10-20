import Registerform from '@/features/auth/components/register-form'
import { requireUnauth } from '@/lib/auth-utils'


const page = async () => {
    await requireUnauth();

    return (
        <div>
            <Registerform />
        </div>
    )
}

export default page
