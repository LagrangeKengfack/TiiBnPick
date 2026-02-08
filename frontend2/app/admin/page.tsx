'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  Package,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  RefreshCw,
  Clock,
  Phone,
  Mail,
  LayoutDashboard,
  UserCheck,
  LogOut,
  X,
  MoreHorizontal,
  MapPin,
  Bike,
  Car,
  CreditCard,
} from 'lucide-react'
import { withAuth } from '@/components/hoc/withAuth'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { TruckIcon } from '@heroicons/react/24/outline'
import { MdDeliveryDining } from 'react-icons/md'
import { BsBicycle } from 'react-icons/bs'
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Types
interface DeliveryPersonRequest {
  id: string
  name: string
  email: string
  phone: string
  location: string
  vehicleType: string
  vehicleBrand: string
  vehicleModel: string
  vehicleRegNumber: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  idCardVerified: boolean
  vehicleRegVerified: boolean
  insuranceVerified: boolean
  createdAt: string
  updatedAt: string
  profilePhoto?: string
  idCardRectoPhoto?: string
  idCardVersoPhoto?: string
  idCardNumber?: string
  nineNumber?: string
  niuPhoto?: string
  vehicleFrontPhoto?: string
  vehicleBackPhoto?: string
  vehicleColor?: string
}

interface Account {
  id: string
  name: string
  email: string
  phone: string
  role: 'DELIVERY' | 'AGENCY' | 'POINT' | 'CLIENT'
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED'
  deliveriesCount: number
  lastActivityAt: string | null
  createdAt: string
  updatedAt: string
  subscriptionStatus?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  subscriptionEndDate?: string | null
}

type ActiveView = 'dashboard' | 'registrations' | 'accounts' | 'subscriptions'

export function SuperAdminDashboard() {
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<DeliveryPersonRequest | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [suspensionEndDate, setSuspensionEndDate] = useState<Date | undefined>(undefined)
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | 'suspend' | 'revoke' | 'restore' | null>(null)
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [registrationRequests, setRegistrationRequests] = useState<DeliveryPersonRequest[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])

  // Filtres pour la page comptes
  const [accountTypeFilter, setAccountTypeFilter] = useState<'all' | 'DELIVERY' | 'CLIENT'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Super admin info from context if available
  const superAdminName = user ? `${user.lastName} ${user.firstName}` : 'Charles Henry'

  const sidebarItems = [
    { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'registrations' as const, icon: UserCheck, label: 'Inscriptions' },
    { id: 'accounts' as const, icon: ShieldCheck, label: 'Comptes' },
    { id: 'subscriptions' as const, icon: CreditCard, label: 'Abonnements' },
  ]

  // Fetch data on component mount
  useEffect(() => {
    fetchRegistrations()
    fetchAccounts()
  }, [])

  // Fetch registration requests
  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/registrations')
      if (response && response.data) {
        setRegistrationRequests(response.data)
      } else {
        // Fallback avec données de test
        const testData: DeliveryPersonRequest[] = [
          {
            id: '1',
            name: 'Jean Dupont',
            email: 'jean.dupont@example.com',
            phone: '+33612345678',
            location: 'Paris, 75001',
            vehicleType: 'Moto',
            vehicleBrand: 'Honda',
            vehicleModel: 'CB500',
            vehicleRegNumber: 'AB-123-CD',
            status: 'PENDING',
            idCardVerified: true,
            vehicleRegVerified: false,
            insuranceVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
            vehicleColor: 'Noir',
          }
        ]
        setRegistrationRequests(testData)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      const response = await api.get('/api/accounts')
      if (response && response.data) {
        setAccounts(response.data)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  const stats = {
    pendingRegistrations: registrationRequests.filter(r => r.status === 'PENDING').length,
    activeDeliveryPersons: accounts.filter(a => a.role === 'DELIVERY' && a.status === 'ACTIVE').length,
    suspendedAccounts: accounts.filter(a => a.status === 'SUSPENDED').length,
    revokedAccounts: accounts.filter(a => a.status === 'REVOKED').length
  }

  const handleSuspendAccount = (account: Account) => {
    setSelectedAccount(account)
    setSuspensionEndDate(undefined)
    setActionDialog('suspend')
  }

  const handleRevokeAccount = (account: Account) => {
    setSelectedAccount(account)
    setActionDialog('revoke')
  }

  const handleRestoreAccount = (account: Account) => {
    setSelectedAccount(account)
    setActionDialog('restore')
  }

  const handleActivateSubscription = (account: Account) => {
    const newEndDate = new Date()
    newEndDate.setDate(newEndDate.getDate() + 30)

    setAccounts(accounts.map(a => a.id === account.id ? {
      ...a,
      subscriptionStatus: 'ACTIVE',
      subscriptionEndDate: newEndDate.toISOString()
    } : a))

    toast({
      title: 'Abonnement activé',
      description: `L'abonnement de ${account.name} a été activé pour 30 jours.`
    })
  }

  const confirmAction = async () => {
    try {
      if (actionDialog === 'approve' && selectedRequest) {
        await api.post(`/api/registrations/${selectedRequest.id}/approve`)
        toast({ title: 'Approuvé', description: 'Le livreur a été approuvé.' })
        await fetchRegistrations()
        await fetchAccounts()
      } else if (actionDialog === 'suspend' && selectedAccount) {
        await api.post(`/api/accounts/${selectedAccount.id}/suspend`, {
          endDate: suspensionEndDate ? suspensionEndDate.toISOString() : null
        })
        toast({ title: 'Suspendu', description: 'Le compte a été suspendu.' })
        setAccounts(accounts.map(a => a.id === selectedAccount.id ? { ...a, status: 'SUSPENDED' } : a))
      } else if (actionDialog === 'revoke' && selectedAccount) {
        await api.post(`/api/accounts/${selectedAccount.id}/revoke`)
        toast({ title: 'Révoqué', description: 'Le compte a été révoqué.', variant: 'destructive' })
        setAccounts(accounts.map(a => a.id === selectedAccount.id ? { ...a, status: 'REVOKED' } : a))
      } else if (actionDialog === 'restore' && selectedAccount) {
        await api.post(`/api/accounts/${selectedAccount.id}/restore`)
        toast({ title: 'Restauré', description: 'Le compte a été restauré.' })
        setAccounts(accounts.map(a => a.id === selectedAccount.id ? { ...a, status: 'ACTIVE' } : a))
      }
    } catch (error) {
      console.error('Action error:', error)
      toast({ title: 'Erreur', description: 'L\'opération a échoué.', variant: 'destructive' })
    }
    setActionDialog(null)
    setSelectedRequest(null)
    setSelectedAccount(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>
      case 'ACTIVE': return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Actif</Badge>
      case 'SUSPENDED': return <Badge variant="outline" className="bg-orange-50 text-orange-700"><AlertTriangle className="w-3 h-3 mr-1" /> Suspendu</Badge>
      case 'REVOKED': return <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" /> Révoqué</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'DELIVERY': return <Badge className="bg-orange-600 text-white">Livreur</Badge>
      case 'CLIENT': return <Badge variant="outline">Client</Badge>
      default: return <Badge>{role}</Badge>
    }
  }

  const getFilteredAccounts = () => {
    let filtered = accounts
    if (accountTypeFilter !== 'all') filtered = filtered.filter(a => a.role === accountTypeFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(a => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
    }
    return filtered
  }

  const getVehicleIcon = (type: string) => {
    const t = type.toLowerCase()
    return (
      <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-orange-500">
        {t.includes('moto') ? <BsBicycle className="w-6 h-6 text-orange-500" /> : <Car className="w-6 h-6 text-orange-500" />}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-orange-600 flex flex-col border-r border-orange-700">
        <div className="h-20 flex items-center justify-center px-4 border-b border-orange-700">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-white" />
            <div className="text-white">
              <h1 className="text-lg font-bold">TiiBnPick</h1>
              <p className="text-xs">Super Admin</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white", activeView === item.id ? "bg-white text-orange-600 shadow-md" : "hover:bg-orange-500")}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-orange-700 text-white flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-sm">{superAdminName}</p>
            <p className="text-xs opacity-75 truncate">admin@tiibnpick.com</p>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-orange-500" onClick={logout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col ml-64">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold">
            {activeView === 'dashboard' && 'Dashboard'}
            {activeView === 'registrations' && 'Inscriptions'}
            {activeView === 'accounts' && 'Comptes'}
            {activeView === 'subscriptions' && 'Abonnements'}
          </h2>
          <Button onClick={() => { fetchRegistrations(); fetchAccounts() }} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
          </Button>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {activeView === 'dashboard' && (
            <div className="grid grid-cols-4 gap-4">
              <Card><CardHeader><CardDescription>En attente</CardDescription><CardTitle>{stats.pendingRegistrations}</CardTitle></CardHeader></Card>
              <Card><CardHeader><CardDescription>Livreurs</CardDescription><CardTitle>{stats.activeDeliveryPersons}</CardTitle></CardHeader></Card>
              <Card><CardHeader><CardDescription>Suspendus</CardDescription><CardTitle>{stats.suspendedAccounts}</CardTitle></CardHeader></Card>
              <Card><CardHeader><CardDescription>Révoqués</CardDescription><CardTitle>{stats.revokedAccounts}</CardTitle></CardHeader></Card>
            </div>
          )}

          {activeView === 'registrations' && (
            <div className="space-y-4">
              {registrationRequests.map(r => (
                <Card key={r.id} onClick={() => setSelectedRequest(r)} className="cursor-pointer hover:shadow-md">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getVehicleIcon(r.vehicleType)}
                      <div>
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-xs text-gray-500">{r.vehicleBrand} {r.vehicleModel}</div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-orange-600">{r.vehicleRegNumber}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeView === 'accounts' && (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Rôle</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {getFilteredAccounts().map(a => (
                      <TableRow key={a.id}>
                        <TableCell>{a.name}</TableCell>
                        <TableCell>{getRoleBadge(a.role)}</TableCell>
                        <TableCell>{getStatusBadge(a.status)}</TableCell>
                        <TableCell className="text-right flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleSuspendAccount(a)}><AlertTriangle className="w-4 h-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRevokeAccount(a)}><Ban className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeView === 'subscriptions' && (
            <Table>
              <TableHeader><TableRow><TableHead>Livreur</TableHead><TableHead>Statut</TableHead><TableHead>Expiration</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {accounts.filter(a => a.role === 'DELIVERY').map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{a.name}</TableCell>
                    <TableCell><Badge>{a.subscriptionStatus === 'ACTIVE' ? 'Actif' : 'Inactif'}</Badge></TableCell>
                    <TableCell>{a.subscriptionEndDate ? format(new Date(a.subscriptionEndDate), "dd/MM/yyyy") : '-'}</TableCell>
                    <TableCell className="text-right">
                      {a.subscriptionStatus !== 'ACTIVE' && <Button size="sm" onClick={() => handleActivateSubscription(a)}>Activer</Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </main>
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Détails Inscription</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p><strong>Nom:</strong> {selectedRequest?.name}</p>
            <p><strong>Véhicule:</strong> {selectedRequest?.vehicleBrand} {selectedRequest?.vehicleModel}</p>
            <p><strong>Plaque:</strong> {selectedRequest?.vehicleRegNumber}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog('reject')}>Refuser</Button>
            <Button onClick={() => setActionDialog('approve')}>Accepter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!actionDialog && actionDialog !== 'suspend'} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirmer l'action</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>Êtes-vous sûr ?</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={actionDialog === 'suspend'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Suspendre le compte</DialogTitle></DialogHeader>
          <Popover>
            <PopoverTrigger asChild><Button variant="outline">{suspensionEndDate ? format(suspensionEndDate, "PPP") : "Choisir une date"}</Button></PopoverTrigger>
            <PopoverContent><Calendar mode="single" selected={suspensionEndDate} onSelect={setSuspensionEndDate} disabled={d => d < new Date()} /></PopoverContent>
          </Popover>
          <DialogFooter><Button onClick={confirmAction}>Suspendre</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAuth(SuperAdminDashboard, ['ADMIN'])
