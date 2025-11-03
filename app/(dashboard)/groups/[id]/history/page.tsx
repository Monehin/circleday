import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { ReminderHistoryList } from '@/components/dashboard/reminder-history-list'
import { ReminderStatsCards } from '@/components/dashboard/reminder-stats-cards'
import { Loader } from '@/components/ui/loader'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { db } from '@/lib/db'

interface ReminderHistoryPageProps {
  params: { id: string }
  searchParams: {
    status?: string
    channel?: string
    page?: string
  }
}

async function getGroup(groupId: string, userId: string) {
  const group = await db.group.findFirst({
    where: {
      id: groupId,
      deletedAt: null,
      memberships: {
        some: {
          userId,
          status: 'ACTIVE',
        },
      },
    },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
        include: {
          contact: true,
        },
      },
    },
  })

  return group
}

export default async function ReminderHistoryPage({
  params,
  searchParams,
}: ReminderHistoryPageProps) {
  // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect(`/login?redirectTo=/groups/${params.id}/history`)
  }

  // Get group
  const group = await getGroup(params.id, session.user.id)

  if (!group) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/groups">Groups</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/groups/${params.id}`}>
              {group.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Reminder History</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <DashboardHeader
        title="Reminder History"
        description={`View all reminders sent for ${group.name}`}
      />

      {/* Statistics Cards */}
      <Suspense fallback={<Loader />}>
        <ReminderStatsCards groupId={params.id} />
      </Suspense>

      {/* Reminder History List */}
      <Suspense fallback={<Loader />}>
        <ReminderHistoryList
          groupId={params.id}
          groupName={group.name}
          status={searchParams.status}
          channel={searchParams.channel}
          page={searchParams.page ? parseInt(searchParams.page) : 1}
        />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Reminder History',
  description: 'View reminder delivery history and status',
}

