'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { 
  FileText, 
  AlertTriangle, 
  Megaphone, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

interface Activity {
  id: string
  type: 'request' | 'complaint' | 'announcement'
  title: string
  description?: string
  status?: string
  createdAt: string
  user?: {
    firstName: string
    lastName: string
  }
}

interface RecentActivityProps {
  activities: Activity[]
  title: string
}

const typeIcons = {
  request: FileText,
  complaint: AlertTriangle,
  announcement: Megaphone,
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  PUBLISHED: 'bg-blue-100 text-blue-800',
}

export function RecentActivity({ activities, title }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            ) : (
              activities.map((activity) => {
                const Icon = typeIcons[activity.type]
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {activity.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {activity.status && (
                          <Badge className={statusColors[activity.status] || ''} variant="secondary">
                            {activity.status}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
