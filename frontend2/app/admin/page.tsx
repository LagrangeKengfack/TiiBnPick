'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import axiosInstance from '@/lib/axios'
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
  Loader2,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { TruckIcon } from '@heroicons/react/24/outline'
import { MdDeliveryDining } from 'react-icons/md'
import { BsBicycle } from 'react-icons/bs'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { withAuth } from '@/components/hoc/withAuth'

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
  idCardPhoto?: string
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
  photoCard?: string
}

type ActiveView = 'dashboard' | 'registrations' | 'accounts' | 'subscriptions'

// Ensure photo path starts with / for Next.js rewrite proxy
const photoUrl = (path?: string | null): string => {
  if (!path) return ''
  if (path.startsWith('/') || path.startsWith('data:') || path.startsWith('http')) return path
  return '/' + path
}

function SuperAdminDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<DeliveryPersonRequest | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | 'suspend' | 'revoke' | 'restore' | null>(null)
  const [suspensionEndDate, setSuspensionEndDate] = useState<Date | undefined>(undefined)
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [registrationRequests, setRegistrationRequests] = useState<DeliveryPersonRequest[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountDetailData, setAccountDetailData] = useState<any>(null)
  const [showAccountDetail, setShowAccountDetail] = useState(false)

  // Filtres pour la page comptes
  const [accountTypeFilter, setAccountTypeFilter] = useState<'all' | 'DELIVERY' | 'CLIENT'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Super admin info - from auth context
  const { user, loading: authLoading, logout } = useAuth()
  const adminName = user ? `${user.firstName} ${user.lastName}` : 'Admin'
  const adminEmail = user?.email || 'admin@tiibntick.com'

  // Auth verification state - prevents rendering dashboard until auth is confirmed
  const [authVerified, setAuthVerified] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    if (authLoading) return

    if (!user || user.userType !== 'ADMIN') {
      router.replace('/')
    } else {
      setAuthVerified(true)
    }
  }, [authLoading, user, router])

  // Dashboard stats from backend
  const [stats, setStats] = useState({
    pendingRegistrations: 0,
    activeDeliveryPersons: 0,
    suspendedAccounts: 0,
    revokedAccounts: 0
  })

  // Fetch dashboard stats from backend
  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/admin/dashboard-stats')
      const data = response.data
      setStats({
        pendingRegistrations: data.pendingCount || 0,
        activeDeliveryPersons: data.activeCount || 0,
        suspendedAccounts: data.suspendedCount || 0,
        revokedAccounts: data.revokedCount || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }, [])

  // Fetch registration requests from backend (PENDING delivery persons)
  const fetchRegistrations = useCallback(async () => {
    try {
      console.log('[Admin] Fetching registrations from /api/admin/delivery-persons?status=PENDING')
      const response = await axiosInstance.get('/api/admin/delivery-persons', {
        params: { status: 'PENDING' }
      })
      const data = response.data
      console.log('[Admin] Registrations response:', JSON.stringify(data).substring(0, 500))
      console.log('[Admin] Is array?', Array.isArray(data), 'Length:', Array.isArray(data) ? data.length : 'N/A')
      // Map backend DeliveryPersonDetailsResponse to frontend DeliveryPersonRequest
      const mapped: DeliveryPersonRequest[] = (Array.isArray(data) ? data : []).map((dp: any) => ({
        id: dp.id,
        name: `${dp.firstName || ''} ${dp.lastName || ''}`.trim(),
        email: dp.email || '',
        phone: dp.phone || '',
        location: dp.commercialName || '',
        vehicleType: dp.vehicleType || '',
        vehicleBrand: dp.vehicleBrand || '',
        vehicleModel: dp.vehicleModel || '',
        vehicleRegNumber: dp.vehicleRegNumber || '',
        status: dp.status as 'PENDING' | 'APPROVED' | 'REJECTED',
        idCardVerified: dp.idCardVerified || false,
        vehicleRegVerified: dp.vehicleRegVerified || false,
        insuranceVerified: dp.insuranceVerified || false,
        createdAt: dp.createdAt || new Date().toISOString(),
        updatedAt: dp.updatedAt || new Date().toISOString(),
        idCardNumber: dp.nationalId || '',
        nineNumber: dp.nuiNumber || '',
        niuPhoto: dp.nuiPhoto || undefined,
        idCardRectoPhoto: dp.cniRecto || undefined,
        idCardVersoPhoto: dp.cniVerso || undefined,
        vehicleFrontPhoto: dp.vehicleFrontPhoto || undefined,
        vehicleBackPhoto: dp.vehicleBackPhoto || undefined,
        vehicleColor: dp.vehicleColor || undefined,
        profilePhoto: dp.photoCard || undefined,
      })).sort((a: DeliveryPersonRequest, b: DeliveryPersonRequest) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      console.log('[Admin] Mapped registrations count:', mapped.length)
      setRegistrationRequests(mapped)
    } catch (error: any) {
      console.error('[Admin] Error fetching registrations:', error?.response?.status, error?.response?.data, error?.message)
      setRegistrationRequests([])
    }
  }, [])

  // Fetch accounts from backend (non-PENDING delivery persons + clients)
  const fetchAccounts = useCallback(async () => {
    try {
      // Fetch delivery persons (all except PENDING)
      console.log('[Admin] Fetching delivery persons from /api/admin/delivery-persons')
      const dpResponse = await axiosInstance.get('/api/admin/delivery-persons')
      console.log('[Admin] Delivery persons response:', JSON.stringify(dpResponse.data).substring(0, 500))
      const dpData = Array.isArray(dpResponse.data) ? dpResponse.data : []
      const deliveryAccounts: Account[] = dpData
        .filter((dp: any) => dp.status !== 'PENDING')
        .map((dp: any) => ({
          id: dp.id,
          name: `${dp.firstName || ''} ${dp.lastName || ''}`.trim(),
          email: dp.email || '',
          phone: dp.phone || '',
          role: 'DELIVERY' as const,
          status: dp.status === 'APPROVED' ? 'ACTIVE' as const :
            dp.status === 'SUSPENDED' ? 'SUSPENDED' as const :
              dp.status === 'REVOKED' ? 'REVOKED' as const : 'ACTIVE' as const,
          deliveriesCount: 0,
          lastActivityAt: dp.updatedAt || null,
          createdAt: dp.createdAt || new Date().toISOString(),
          updatedAt: dp.updatedAt || new Date().toISOString(),
          photoCard: dp.photoCard || undefined,
        }))
      console.log('[Admin] Delivery accounts (non-PENDING):', deliveryAccounts.length)

      // Fetch clients
      console.log('[Admin] Fetching clients from /api/admin/clients')
      const clientResponse = await axiosInstance.get('/api/admin/clients')
      console.log('[Admin] Clients response:', JSON.stringify(clientResponse.data).substring(0, 500))
      const clientData = Array.isArray(clientResponse.data) ? clientResponse.data : []
      const clientAccounts: Account[] = clientData.map((client: any) => ({
        id: client.id,
        name: `${client.firstName || ''} ${client.lastName || ''}`.trim(),
        email: client.email || '',
        phone: client.phone || '',
        role: 'CLIENT' as const,
        status: client.status === 'SUSPENDED' ? 'SUSPENDED' as const :
          client.status === 'REVOKED' ? 'REVOKED' as const : 'ACTIVE' as const,
        deliveriesCount: client.totalDeliveries || 0,
        lastActivityAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        photoCard: client.photoCard || undefined,
      }))
      console.log('[Admin] Client accounts:', clientAccounts.length)

      setAccounts([...deliveryAccounts, ...clientAccounts])
      console.log('[Admin] Total accounts set:', deliveryAccounts.length + clientAccounts.length)
    } catch (error: any) {
      console.error('[Admin] Error fetching accounts:', error?.response?.status, error?.response?.data, error?.message)
      setAccounts([])
    }
  }, [])

  // Fetch data on component mount
  useEffect(() => {
    fetchRegistrations()
    fetchAccounts()
    fetchDashboardStats()
    setLoading(false)
  }, [fetchRegistrations, fetchAccounts, fetchDashboardStats])

  // Show loading screen until auth is verified - prevents dashboard flash
  // IMPORTANT: This guard must be AFTER all hooks to comply with Rules of Hooks
  if (authLoading || !authVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-orange-600 mx-auto" />
          <p className="text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const sidebarItems = [
    { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'registrations' as const, icon: UserCheck, label: 'Inscriptions' },
    { id: 'accounts' as const, icon: ShieldCheck, label: 'Comptes' },
    { id: 'subscriptions' as const, icon: CreditCard, label: 'Abonnements' },
  ]

  // Handler functions
  const handleApproveRegistration = (request: DeliveryPersonRequest) => {
    setSelectedRequest(request)
    setActionDialog('approve')
  }

  const handleRejectRegistration = (request: DeliveryPersonRequest) => {
    setSelectedRequest(request)
    setActionDialog('reject')
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
    // Subscription not yet implemented - greyed out
    toast({
      title: 'Fonctionnalité à venir',
      description: 'La gestion des abonnements sera disponible prochainement.',
    })
  }

  // Fetch account details when clicking an account in the table
  const handleAccountClick = async (account: Account) => {
    setSelectedAccount(account)
    if (account.role === 'DELIVERY') {
      try {
        const response = await axiosInstance.get(`/api/admin/delivery-persons/${account.id}`)
        setAccountDetailData(response.data)
      } catch (error) {
        console.error('[Admin] Error fetching account details:', error)
        setAccountDetailData(null)
      }
    } else {
      // For non-delivery accounts, use photoCard from account data
      setAccountDetailData(account.photoCard ? { photoCard: account.photoCard } : null)
    }
    setShowAccountDetail(true)
  }

  const confirmAction = async () => {
    try {
      if (actionDialog === 'approve' && selectedRequest) {
        await axiosInstance.put('/api/admin/delivery-persons/validate', {
          deliveryPersonId: selectedRequest.id,
          approved: true
        })
        toast({
          title: 'Inscription approuvée',
          description: `Le livreur ${selectedRequest.name} a été approuvé avec succès.`
        })
        // Remove from registrations list immediately
        setRegistrationRequests(prev => prev.filter(r => r.id !== selectedRequest.id))
        await fetchAccounts()
        await fetchDashboardStats()
      } else if (actionDialog === 'reject' && selectedRequest) {
        await axiosInstance.put('/api/admin/delivery-persons/validate', {
          deliveryPersonId: selectedRequest.id,
          approved: false,
          reason: 'Rejeté par l\'administrateur'
        })
        toast({
          title: 'Inscription rejetée',
          description: `La demande de ${selectedRequest.name} a été rejetée.`,
          variant: 'destructive'
        })
        // Remove from registrations list immediately
        setRegistrationRequests(prev => prev.filter(r => r.id !== selectedRequest.id))
        await fetchDashboardStats()
      } else if (actionDialog === 'suspend' && selectedAccount) {
        const endpoint = selectedAccount.role === 'CLIENT'
          ? `/api/admin/clients/${selectedAccount.id}/suspend`
          : `/api/admin/delivery-persons/${selectedAccount.id}/suspend`
        await axiosInstance.put(endpoint)
        toast({
          title: 'Compte suspendu',
          description: `Le compte de ${selectedAccount.name} a été suspendu.`
        })
        setAccounts(accounts.map(a => a.id === selectedAccount.id ? { ...a, status: 'SUSPENDED' as const } : a))
        await fetchDashboardStats()
      } else if (actionDialog === 'revoke' && selectedAccount) {
        const endpoint = selectedAccount.role === 'CLIENT'
          ? `/api/admin/clients/${selectedAccount.id}/revoke`
          : `/api/admin/delivery-persons/${selectedAccount.id}/revoke`
        await axiosInstance.put(endpoint)
        toast({
          title: 'Compte révoqué',
          description: `Le compte de ${selectedAccount.name} a été révoqué définitivement.`,
          variant: 'destructive'
        })
        setAccounts(accounts.map(a => a.id === selectedAccount.id ? { ...a, status: 'REVOKED' as const } : a))
        await fetchDashboardStats()
      } else if (actionDialog === 'restore' && selectedAccount) {
        const endpoint = selectedAccount.role === 'CLIENT'
          ? `/api/admin/clients/${selectedAccount.id}/activate`
          : `/api/admin/delivery-persons/${selectedAccount.id}/activate`
        await axiosInstance.put(endpoint)
        toast({
          title: 'Compte restauré',
          description: `Le compte de ${selectedAccount.name} a été restauré avec succès.`
        })
        setAccounts(accounts.map(a => a.id === selectedAccount.id ? { ...a, status: 'ACTIVE' as const } : a))
        await fetchDashboardStats()
      }
    } catch (error) {
      console.error('Error performing action:', error)
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'opération.',
        variant: 'destructive'
      })
    }
    setActionDialog(null)
    setSelectedRequest(null)
    setSelectedAccount(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>
      case 'APPROVED':
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Actif</Badge>
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejeté</Badge>
      case 'SUSPENDED':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200"><AlertTriangle className="w-3 h-3 mr-1" /> Suspendu</Badge>
      case 'REVOKED':
        return <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" /> Révoqué</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'DELIVERY':
        return <Badge variant="secondary" className="bg-orange-600 text-white border-orange-600">Livreur</Badge>
      case 'CLIENT':
        return <Badge variant="secondary" className="bg-white text-orange-700 border-orange-300">Client</Badge>
      case 'AGENCY':
        return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">Agence</Badge>
      case 'POINT':
        return <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-200">Point Relais</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  // Fonction pour filtrer les comptes
  const getFilteredAccounts = () => {
    let filtered = accounts

    // Filtre par type de compte
    if (accountTypeFilter !== 'all') {
      filtered = filtered.filter(account => account.role === accountTypeFilter)
    }

    // Filtre par recherche (nom, prénom, email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(account =>
        account.name.toLowerCase().includes(query) ||
        account.email.toLowerCase().includes(query)
      )
    }

    return filtered
  }

  // Vehicle icon component matching backend LogisticsType enum values
  const VehicleIcon = ({ type }: { type: string }) => {
    const vehicleType = type.toUpperCase()

    switch (vehicleType) {
      case 'MOTORBIKE':
        return <Bike className="w-6 h-6 text-orange-500" />
      case 'SCOOTER':
        return <MdDeliveryDining className="w-6 h-6 text-orange-500" />
      case 'TRUCK':
        return <TruckIcon className="w-6 h-6 text-orange-500" />
      case 'VAN':
        return <TruckIcon className="w-6 h-6 text-orange-500" />
      case 'CAR':
        return <Car className="w-6 h-6 text-orange-500" />
      case 'BIKE':
        return <BsBicycle className="w-6 h-6 text-orange-500" />
      default:
        return <Car className="w-6 h-6 text-orange-500" />
    }
  }

  const getVehicleIcon = (vehicleType: string) => {
    return (
      <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-orange-500">
        <VehicleIcon type={vehicleType} />
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar - Vertical à gauche, toujours visible */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-orange-600 dark:bg-orange-700 flex flex-col border-r border-orange-700">
        {/* Logo */}
        <div className="h-20 flex items-center justify-center px-4 border-b border-orange-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-white">
              <h1 className="text-lg font-bold leading-tight">
                TiiB<span className="text-orange-200">n</span>Tick
              </h1>
              <p className="text-xs text-orange-100">Super Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                  isActive
                    ? 'bg-white text-orange-600 font-semibold shadow-md'
                    : 'text-white hover:bg-orange-500/50 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-orange-700">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
              {adminName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">{adminName}</p>
              <p className="text-xs text-orange-100 truncate">{adminEmail}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 text-white hover:text-white hover:bg-orange-500/50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen ml-64">
        {/* Top Bar */}
        <header className="h-16 border-b bg-white dark:bg-gray-800 sticky top-0 z-30 flex items-center justify-between px-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {activeView === 'dashboard' && 'Dashboard'}
              {activeView === 'registrations' && 'Demandes d\'inscription'}
              {activeView === 'accounts' && 'Gestion des comptes'}
              {activeView === 'subscriptions' && 'Gestion des Abonnements'}
            </h2>
          </div>
          <Button
            onClick={() => { fetchRegistrations(); fetchAccounts() }}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold">
                  Bienvenue, <span className="text-orange-600">{adminName}</span>
                </h2>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card className="hover:shadow-md transition-shadow flex flex-col">
                  <CardHeader className="pb-3 px-4 py-3">
                    <CardDescription className="text-[10px] md:text-xs text-black">En attente</CardDescription>
                    <CardTitle className="text-xl md:text-2xl text-orange-600">{stats.pendingRegistrations}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 mt-auto">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      Inscriptions
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow flex flex-col">
                  <CardHeader className="pb-3 px-4 py-3">
                    <CardDescription className="text-[10px] md:text-xs text-black">Livreurs</CardDescription>
                    <CardTitle className="text-xl md:text-2xl text-green-600">{stats.activeDeliveryPersons}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 mt-auto">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="w-3 h-3 mr-1" />
                      Actifs
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow flex flex-col">
                  <CardHeader className="pb-3 px-4 py-3">
                    <CardDescription className="text-[10px] md:text-xs text-black">Suspendus</CardDescription>
                    <CardTitle className="text-xl md:text-2xl text-orange-600">{stats.suspendedAccounts}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 mt-auto">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Comptes
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow flex flex-col">
                  <CardHeader className="pb-3 px-4 py-3">
                    <CardDescription className="text-[10px] md:text-xs text-black">Révoqués</CardDescription>
                    <CardTitle className="text-xl md:text-2xl text-red-600">{stats.revokedAccounts}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 mt-auto">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Ban className="w-3 h-3 mr-1" />
                      Comptes
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView('registrations')}>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <UserCheck className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                      Voir les inscriptions
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">Consultez et validez les nouvelles demandes d'inscription</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView('accounts')}>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                      Gérer les comptes
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">Suspendez ou révoquez les comptes utilisateurs</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow relative opacity-50 pointer-events-none" onClick={() => setActiveView('subscriptions')}>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                      Gérer les abonnements
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">Activez les abonnements des livreurs</CardDescription>
                  </CardHeader>
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                    <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-300 text-xs">Bientôt disponible</Badge>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Registrations View */}
          {activeView === 'registrations' && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center text-muted-foreground">
                    Chargement...
                  </div>
                </div>
              ) : registrationRequests.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">Aucune demande d'inscription</h3>
                    <p className="text-muted-foreground mt-2">
                      Il n'y a pour l'instant aucune demande d'inscription en attente de validation.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {registrationRequests.map((request) => (
                    <Card
                      key={request.id}
                      onClick={() => setSelectedRequest(request)}
                      className="hover:shadow-md transition-colors cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          {/* Left side - Vehicle icon and info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Vehicle Icon */}
                            <div className="flex-shrink-0">
                              {getVehicleIcon(request.vehicleType)}
                            </div>

                            {/* Name and Vehicle Info */}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm truncate">{request.name}</div>
                              <div className="text-xs text-gray-600 truncate">
                                {request.vehicleBrand} {request.vehicleModel}
                              </div>
                            </div>
                          </div>

                          {/* Right side - Creation date */}
                          <div className="flex-shrink-0 text-right">
                            <div className="text-xs text-gray-500">
                              {formatDate(request.createdAt)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Accounts View */}
          {activeView === 'accounts' && (
            <div className="space-y-4">
              {/* Filtres */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Filtre par type de compte */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type de compte
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAccountTypeFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${accountTypeFilter === 'all'
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        Tous ({accounts.length})
                      </button>
                      <button
                        onClick={() => setAccountTypeFilter('DELIVERY')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${accountTypeFilter === 'DELIVERY'
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        Livreurs ({accounts.filter(a => a.role === 'DELIVERY').length})
                      </button>
                      <button
                        onClick={() => setAccountTypeFilter('CLIENT')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${accountTypeFilter === 'CLIENT'
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        Clients ({accounts.filter(a => a.role === 'CLIENT').length})
                      </button>
                    </div>
                  </div>

                  {/* Barre de recherche */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rechercher
                    </label>
                    <input
                      type="text"
                      placeholder="Nom, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Tableau des comptes */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3">
                    <div>
                      <CardTitle className="text-lg md:text-xl">Gestion des comptes</CardTitle>
                      <CardDescription>Gérez les comptes utilisateurs (suspendre, révoquer)</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs md:text-sm">
                        {getFilteredAccounts().length} compte{getFilteredAccounts().length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border max-h-[600px] overflow-auto">
                    {getFilteredAccounts().length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        Aucun compte trouvé
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead className="hidden md:table-cell">Rôle</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                Chargement...
                              </TableCell>
                            </TableRow>
                          ) : (
                            getFilteredAccounts().map((account) => (
                              <TableRow key={account.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleAccountClick(account)}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium text-sm md:text-base">{account.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatDate(account.createdAt)}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="flex items-center text-xs">
                                      <Phone className="w-3 h-3 mr-1 text-muted-foreground" />
                                      <span className="truncate block max-w-[120px]">{account.phone}</span>
                                    </div>
                                    <div className="flex items-center text-xs hidden sm:flex">
                                      <Mail className="w-3 h-3 mr-1 text-muted-foreground" />
                                      <span className="truncate block max-w-[120px]">{account.email}</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {getRoleBadge(account.role)}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(account.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {account.status === 'ACTIVE' && (
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSuspendAccount(account)}
                                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                      >
                                        <AlertTriangle className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleRevokeAccount(account)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Ban className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )}
                                  {account.status === 'SUSPENDED' && (
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRestoreAccount(account)}
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleRevokeAccount(account)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Ban className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )}
                                  {account.status === 'REVOKED' && (
                                    <span className="text-xs text-muted-foreground italic">Révoqué</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}


          {/* Subscriptions View - Greyed out / Coming Soon */}
          {activeView === 'subscriptions' && (
            <div className="space-y-6 relative">
              {/* Overlay "Bientôt disponible" */}
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 rounded-lg backdrop-blur-sm">
                <div className="text-center space-y-3">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto" />
                  <h3 className="text-xl font-semibold text-gray-500">Bientôt disponible</h3>
                  <p className="text-sm text-gray-400 max-w-md">La gestion des abonnements sera disponible dans une prochaine mise à jour.</p>
                </div>
              </div>

              {/* Content underneath (greyed out) */}
              <div className="opacity-40 pointer-events-none select-none">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gestion des Abonnements</h2>
                    <p className="text-muted-foreground">
                      Gérez et activez les abonnements des livreurs.
                    </p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Livreurs</CardTitle>
                    <CardDescription>Liste des livreurs et état de leur abonnement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Livreur</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Statut Abonnement</TableHead>
                          <TableHead>Expiration</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.filter(a => a.role === 'DELIVERY').map((account) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-medium">{account.name}</TableCell>
                            <TableCell>
                              <div className="flex flex-col text-sm text-muted-foreground">
                                <span>{account.email}</span>
                                <span>{account.phone}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={account.subscriptionStatus === 'ACTIVE' ? 'default' : 'secondary'}
                                className={account.subscriptionStatus === 'ACTIVE' ? 'bg-green-600 hover:bg-green-700' : ''}>
                                {account.subscriptionStatus === 'ACTIVE' ? 'Actif' : 'Inactif'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {account.subscriptionEndDate ? formatDate(account.subscriptionEndDate) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {account.subscriptionStatus !== 'ACTIVE' && (
                                <Button
                                  size="sm"
                                  className="bg-orange-600 hover:bg-orange-700 text-white"
                                  onClick={() => handleActivateSubscription(account)}
                                >
                                  Activer (30 jours)
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>

        <Dialog open={selectedRequest !== null} onOpenChange={(open) => !open && setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedRequest && (
              <>
                <DialogHeader>
                  <DialogTitle>Détails de la demande d'inscription</DialogTitle>
                  <DialogDescription>
                    Demande de {selectedRequest.name}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Photo du Livreur */}
                  {selectedRequest.profilePhoto && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 text-gray-900">Photo du Livreur</h3>
                      <div className="flex justify-center">
                        <img
                          src={photoUrl(selectedRequest.profilePhoto)}
                          alt="Photo du livreur"
                          className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Informations Personnelles */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-gray-900">Informations Personnelles</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Nom Complet</label>
                        <p className="font-medium">{selectedRequest.name}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Email</label>
                        <p className="font-medium">{selectedRequest.email}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Téléphone</label>
                        <p className="font-medium">{selectedRequest.phone}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Localisation</label>
                        <p className="font-medium">{selectedRequest.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Informations Personnelles (Suite) */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRequest.nineNumber && (
                      <div>
                        <label className="text-xs text-gray-500">Numéro NINE</label>
                        <p className="font-mono font-bold text-orange-600">{selectedRequest.nineNumber}</p>
                      </div>
                    )}
                  </div>

                  {/* Document NIU */}
                  {selectedRequest.niuPhoto && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 text-gray-900">Document NIU</h3>
                      <div className="flex justify-center">
                        <img
                          src={photoUrl(selectedRequest.niuPhoto)}
                          alt="Document NIU"
                          className="w-full max-h-48 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Pièce d'Identité */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-gray-900">Pièce d'Identité</h3>
                    <div className="space-y-3">
                      {selectedRequest.idCardNumber && (
                        <div>
                          <label className="text-xs text-gray-500">Numéro CNI</label>
                          <p className="font-mono font-bold text-orange-600">{selectedRequest.idCardNumber}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {selectedRequest.idCardRectoPhoto && (
                          <div>
                            <label className="text-xs text-gray-500 block mb-2">Photo CNI Recto</label>
                            <img
                              src={photoUrl(selectedRequest.idCardRectoPhoto)}
                              alt="Photo CNI Recto"
                              className="w-full max-h-32 rounded-lg object-cover border border-gray-200"
                            />
                          </div>
                        )}
                        {selectedRequest.idCardVersoPhoto && (
                          <div>
                            <label className="text-xs text-gray-500 block mb-2">Photo CNI Verso</label>
                            <img
                              src={photoUrl(selectedRequest.idCardVersoPhoto)}
                              alt="Photo CNI Verso"
                              className="w-full max-h-32 rounded-lg object-cover border border-gray-200"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Informations Véhicule */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-gray-900">Informations Véhicule</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-xs text-gray-500">Type de Véhicule</label>
                        <p className="font-medium">{selectedRequest.vehicleType}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Nom du véhicule</label>
                        <p className="font-medium">{selectedRequest.vehicleBrand} {selectedRequest.vehicleModel}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Plaque d'Immatriculation</label>
                        <p className="font-mono font-bold text-lg text-orange-600">{selectedRequest.vehicleRegNumber}</p>
                      </div>
                      {selectedRequest.vehicleColor && (
                        <div>
                          <label className="text-xs text-gray-500">Couleur</label>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-200"
                              style={{ backgroundColor: selectedRequest.vehicleColor.toLowerCase() === 'blanc' ? '#ffffff' : selectedRequest.vehicleColor.toLowerCase() === 'noir' ? '#000000' : selectedRequest.vehicleColor }}
                            />
                            <p className="font-medium">{selectedRequest.vehicleColor}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Photos du Véhicule */}
                    {(selectedRequest.vehicleFrontPhoto || selectedRequest.vehicleBackPhoto) && (
                      <div className="space-y-4">
                        <div className="text-xs text-gray-500 font-semibold mb-2">Photos du Véhicule</div>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedRequest.vehicleFrontPhoto && (
                            <div>
                              <label className="text-xs text-gray-500 block mb-2">Vue Avant</label>
                              <img
                                src={photoUrl(selectedRequest.vehicleFrontPhoto)}
                                alt="Vue avant du véhicule"
                                className="w-full h-32 rounded-lg object-cover border border-gray-200"
                              />
                            </div>
                          )}
                          {selectedRequest.vehicleBackPhoto && (
                            <div>
                              <label className="text-xs text-gray-500 block mb-2">Vue Arrière</label>
                              <img
                                src={photoUrl(selectedRequest.vehicleBackPhoto)}
                                alt="Vue arrière du véhicule"
                                className="w-full h-32 rounded-lg object-cover border border-gray-200"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Statut */}
                  <div>
                    <label className="text-xs text-gray-500">Statut</label>
                    <div className="mt-2">
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="bg-white text-orange-700 border-orange-300 hover:bg-orange-50"
                    onClick={() => {
                      setActionDialog('reject')
                    }}
                  >
                    Refuser
                  </Button>
                  <Button
                    className="bg-orange-600 hover:bg-orange-700 text-white border border-orange-600"
                    onClick={() => {
                      setActionDialog('approve')
                    }}
                  >
                    Accepter
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Account Details Dialog */}
        <Dialog open={showAccountDetail} onOpenChange={(open) => { if (!open) { setShowAccountDetail(false); setAccountDetailData(null); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedAccount && (
              <>
                <DialogHeader>
                  <DialogTitle>Informations du compte</DialogTitle>
                  <DialogDescription>
                    Compte de {selectedAccount.name}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Photo d'identité */}
                  {(selectedAccount.photoCard || (accountDetailData && accountDetailData.photoCard)) && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 text-gray-900">Photo d'identité</h3>
                      <div className="flex justify-center">
                        <img
                          src={photoUrl(accountDetailData?.photoCard || selectedAccount.photoCard)}
                          alt="Photo d'identité"
                          className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Statut du compte */}
                  <div>
                    <label className="text-xs text-gray-500">Statut du compte</label>
                    <div className="mt-2">
                      {getStatusBadge(selectedAccount.status)}
                    </div>
                  </div>

                  {/* Informations Personnelles */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-gray-900">Informations Personnelles</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Nom Complet</label>
                        <p className="font-medium">{selectedAccount.name}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Email</label>
                        <p className="font-medium">{selectedAccount.email}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Téléphone</label>
                        <p className="font-medium">{selectedAccount.phone}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Rôle</label>
                        <p className="font-medium">{getRoleBadge(selectedAccount.role)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery person details (fetched from backend) */}
                  {selectedAccount.role === 'DELIVERY' && accountDetailData && (
                    <>
                      {/* NINE Number */}
                      {accountDetailData.nuiNumber && (
                        <div>
                          <label className="text-xs text-gray-500">Numéro NINE</label>
                          <p className="font-mono font-bold text-orange-600">{accountDetailData.nuiNumber}</p>
                        </div>
                      )}

                      {/* Document NIU */}
                      {accountDetailData.nuiPhoto && (
                        <div>
                          <h3 className="text-sm font-semibold mb-3 text-gray-900">Document NIU</h3>
                          <div className="flex justify-center">
                            <img
                              src={photoUrl(accountDetailData.nuiPhoto)}
                              alt="Document NIU"
                              className="w-full max-h-48 rounded-lg object-cover border border-gray-200"
                            />
                          </div>
                        </div>
                      )}

                      {/* Pièce d'Identité */}
                      <div>
                        <h3 className="text-sm font-semibold mb-3 text-gray-900">Pièce d'Identité</h3>
                        <div className="space-y-3">
                          {accountDetailData.nationalId && (
                            <div>
                              <label className="text-xs text-gray-500">Numéro CNI</label>
                              <p className="font-mono font-bold text-orange-600">{accountDetailData.nationalId}</p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            {accountDetailData.cniRecto && (
                              <div>
                                <label className="text-xs text-gray-500 block mb-2">Photo CNI Recto</label>
                                <img
                                  src={photoUrl(accountDetailData.cniRecto)}
                                  alt="Photo CNI Recto"
                                  className="w-full max-h-32 rounded-lg object-cover border border-gray-200"
                                />
                              </div>
                            )}
                            {accountDetailData.cniVerso && (
                              <div>
                                <label className="text-xs text-gray-500 block mb-2">Photo CNI Verso</label>
                                <img
                                  src={photoUrl(accountDetailData.cniVerso)}
                                  alt="Photo CNI Verso"
                                  className="w-full max-h-32 rounded-lg object-cover border border-gray-200"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Informations Véhicule */}
                      <div>
                        <h3 className="text-sm font-semibold mb-3 text-gray-900">Informations Véhicule</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-xs text-gray-500">Type de Véhicule</label>
                            <p className="font-medium">{accountDetailData.vehicleType}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Nom du véhicule</label>
                            <p className="font-medium">{accountDetailData.vehicleBrand} {accountDetailData.vehicleModel}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Plaque d'Immatriculation</label>
                            <p className="font-mono font-bold text-lg text-orange-600">{accountDetailData.vehicleRegNumber}</p>
                          </div>
                          {accountDetailData.vehicleColor && (
                            <div>
                              <label className="text-xs text-gray-500">Couleur</label>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-200"
                                  style={{ backgroundColor: accountDetailData.vehicleColor.toLowerCase() === 'blanc' ? '#ffffff' : accountDetailData.vehicleColor.toLowerCase() === 'noir' ? '#000000' : accountDetailData.vehicleColor }}
                                />
                                <p className="font-medium">{accountDetailData.vehicleColor}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Photos du Véhicule */}
                        {(accountDetailData.vehicleFrontPhoto || accountDetailData.vehicleBackPhoto) && (
                          <div className="space-y-4">
                            <div className="text-xs text-gray-500 font-semibold mb-2">Photos du Véhicule</div>
                            <div className="grid grid-cols-2 gap-3">
                              {accountDetailData.vehicleFrontPhoto && (
                                <div>
                                  <label className="text-xs text-gray-500 block mb-2">Vue Avant</label>
                                  <img
                                    src={photoUrl(accountDetailData.vehicleFrontPhoto)}
                                    alt="Vue avant du véhicule"
                                    className="w-full h-32 rounded-lg object-cover border border-gray-200"
                                  />
                                </div>
                              )}
                              {accountDetailData.vehicleBackPhoto && (
                                <div>
                                  <label className="text-xs text-gray-500 block mb-2">Vue Arrière</label>
                                  <img
                                    src={photoUrl(accountDetailData.vehicleBackPhoto)}
                                    alt="Vue arrière du véhicule"
                                    className="w-full h-32 rounded-lg object-cover border border-gray-200"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <DialogFooter className="gap-2">
                  {selectedAccount.status === 'ACTIVE' && (
                    <>
                      <Button
                        variant="outline"
                        className="text-orange-600 border-orange-300 hover:bg-orange-50"
                        title="Suspendre le compte"
                        onClick={() => {
                          setShowAccountDetail(false)
                          handleSuspendAccount(selectedAccount)
                        }}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Suspendre
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        title="Révoquer le compte définitivement"
                        onClick={() => {
                          setShowAccountDetail(false)
                          handleRevokeAccount(selectedAccount)
                        }}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Révoquer
                      </Button>
                    </>
                  )}
                  {selectedAccount.status === 'SUSPENDED' && (
                    <>
                      <Button
                        variant="outline"
                        className="text-green-600 border-green-300 hover:bg-green-50"
                        title="Restaurer le compte"
                        onClick={() => {
                          setShowAccountDetail(false)
                          handleRestoreAccount(selectedAccount)
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Restaurer
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        title="Révoquer le compte définitivement"
                        onClick={() => {
                          setShowAccountDetail(false)
                          handleRevokeAccount(selectedAccount)
                        }}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Révoquer
                      </Button>
                    </>
                  )}
                  {selectedAccount.status === 'REVOKED' && (
                    <div className="text-sm text-red-600 italic">Ce compte a été révoqué définitivement.</div>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <AlertDialog open={actionDialog !== null && actionDialog !== 'suspend'}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionDialog === 'approve' && 'Confirmer l\'approbation'}
                {actionDialog === 'reject' && 'Rejeter la demande'}
                {actionDialog === 'revoke' && 'Révoquer le compte'}
                {actionDialog === 'restore' && 'Restaurer le compte'}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              {actionDialog === 'approve' && selectedRequest && `Êtes-vous sûr de vouloir approuver la demande de ${selectedRequest.name} ?`}
              {actionDialog === 'reject' && selectedRequest && `Êtes-vous sûr de vouloir rejeter la demande de ${selectedRequest.name} ?`}
              {actionDialog === 'revoke' && selectedAccount && `Êtes-vous sûr de vouloir révoquer le compte de ${selectedAccount.name} ?`}
              {actionDialog === 'restore' && selectedAccount && `Êtes-vous sûr de vouloir restaurer le compte de ${selectedAccount.name} ?`}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-orange-600 border-orange-600 hover:bg-orange-50 hover:text-orange-700">Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmAction}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog spécifique pour la suspension avec date */}
        <Dialog open={actionDialog === 'suspend'} onOpenChange={(open) => !open && setActionDialog(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Suspendre le compte</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir suspendre le compte de {selectedAccount?.name} ?
                Vous pouvez définir une date de fin de suspension optionnelle.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2 py-4">
              <div className="grid flex-1 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !suspensionEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {suspensionEndDate ? format(suspensionEndDate, "PPP") : <span>Choisir une date de fin</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={suspensionEndDate}
                      onSelect={setSuspensionEndDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter className="sm:justify-end">
              <Button variant="outline" onClick={() => setActionDialog(null)} className="text-orange-600 border-orange-600 hover:bg-orange-50 hover:text-orange-700">
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmAction}
                className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
              >
                Confirmer la suspension
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default withAuth(SuperAdminDashboard, ['ADMIN'])
