const months = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
  'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'
]

export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  const day = d.getDate()
  const month = months[d.getMonth()]
  return `${day} ${month}`
}

export function isToday(date: Date | string | number): boolean {
  const d = new Date(date)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

export function isYesterday(date: Date | string | number): boolean {
  const d = new Date(date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return d.toDateString() === yesterday.toDateString()
}

export function isWithinDays(date: Date | string | number, days: number): boolean {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const diffDays = diff / (1000 * 60 * 60 * 24)
  return diffDays <= days
}

export function getDateGroup(date: Date | string | number): string {
  if (isToday(date)) return 'Bugün'
  if (isYesterday(date)) return 'Dün'
  if (isWithinDays(date, 7)) return 'Son 7 gün'
  if (isWithinDays(date, 30)) return 'Son 30 gün'
  return 'Daha eski'
}

export function groupByDate<T extends { updatedAt: string | number }>(items: T[]): Record<string, T[]> {
  const groups: Record<string, T[]> = {}
  const order = ['Bugün', 'Dün', 'Son 7 gün', 'Son 30 gün', 'Daha eski']
  
  order.forEach(group => {
    groups[group] = []
  })
  
  items.forEach(item => {
    const group = getDateGroup(item.updatedAt)
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(item)
  })
  
  return groups
}
