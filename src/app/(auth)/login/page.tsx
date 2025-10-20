import Loginform from '@/features/auth/components/login-from'
import { requireUnauth } from '@/lib/auth-utils'


const page = async () => {
    await requireUnauth();

    return (
        <Loginform />
    )
}

export default page
