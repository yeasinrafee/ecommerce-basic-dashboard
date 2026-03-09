"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import CreateZonePolicy from '@/components/ZonePolicy/CreateZonePolicy'
import { useCreateZonePolicy } from '@/hooks/zone-policy.api'

const Page = () => {
  const router = useRouter()
  const createMutation = useCreateZonePolicy()

  const handleSubmit = async (values: any) => {
    await createMutation.mutateAsync(values)
    router.push('/dashboard/zone-policies/manage')
  }

  return (
    <div className="flex justify-center items-center h-[80dvh]">
     <div className='bg-white w-full max-w-[800px] p-6 border border-slate-200 shadow-sm rounded-md'>
         <CreateZonePolicy inline onSubmit={handleSubmit} submitting={createMutation.isPending} />
     </div>
    </div>
  )
}

export default Page
