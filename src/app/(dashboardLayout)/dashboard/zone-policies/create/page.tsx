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
    router.push('/dashboard/zone-policies')
  }

  return (
    <div className="p-4">
      <CreateZonePolicy inline onSubmit={handleSubmit} submitting={createMutation.isPending} />
    </div>
  )
}

export default Page
