import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client"
import { requireAuth } from "@/lib/auth-utils";

const page = async () => {
  await requireAuth();

  return (
    <div className='text-yellow-500'>
      protected server component
    </div>
  )
}

export default page
