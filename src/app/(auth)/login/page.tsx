import Loginform from '@/features/auth/components/login-from'
import { requireUnauth } from '@/lib/auth-utils'
import React from 'react'

const page = async () => {
    await requireUnauth();

    return (
        <div>
            <Loginform />
        </div>
    )
}

export default page
