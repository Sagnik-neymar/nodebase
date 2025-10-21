"use client"

import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-utils";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const page = () => {
  return (
    <div className='text-yellow-500 w-full min-h-screen flex justify-center items-center'>
      
    </div>
  )
}

export default page
