'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Package,
  MapPin,
  Clock,
  DollarSign,
  Star,
  CheckCircle2,
  Navigation,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Phone,
  Map as MapIcon,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Calendar,
  LayoutDashboard,
  Megaphone,
  Truck,
  Home,
  Crown,
  Award,
  Target,
  Zap,
  BarChart3,
  ArrowUpRight,
  Shield,
} from 'lucide-react'
import { withAuth } from '@/components/hoc/withAuth'
import { useAuth } from '@/context/AuthContext'
import { EarningsChart } from '@/components/charts/earnings-chart'
import { DeliveriesChart } from '@/components/charts/deliveries-chart'
import { ComparisonChart } from '@/components/charts/comparison-chart'
import { useRouter } from 'next/navigation'
import { acceptDelivery as acceptDeliveryService } from '@/services/deliveryService'
import dynamic from 'next/dynamic'
import { getRoute } from '@/services/routing'
import { useEffect } from 'react'

const MapLeaflet = dynamic(() => import('@/components/MapLeaflet'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-100 animate-pulse rounded-xl" />
});

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { ThumbsUp, MessageCircle, Mail, ImageIcon, Heart } from 'lucide-react'

export function LivreurDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Livreur info from context
  const livreurInfo = {
    firstName: user?.firstName || 'Livreur',
    lastName: user?.lastName || '',
    rating: user?.rating || 4.8,
    totalDeliveries: user?.totalDeliveries || 156,
    totalEarnings: 245000,
    phone: user?.phone || '+225 07 00 00 00 00'
  }

  // Statistiques du jour
  const todayStats = {
    deliveries: 8,
    earnings: 12500,
    distance: 42.5,
    tips: 2000
  }

  // Livraisons actives
  const [activeDeliveries, setActiveDeliveries] = useState([
    {
      id: 'TBP-2024-001',
      customerName: 'Amani Yao',
      pickupAddress: 'Cocody, Rue des Jardins',
      deliveryAddress: 'Plateau, Avenue de la République',
      distance: 5.2,
      estimatedTime: '15 min',
      price: 1500,
      status: 'pickup',
      packageType: 'Repas à domicile',
      pickupTime: '10:30',
      urgency: 'urgent'
    },
    {
      id: 'TBP-2024-002',
      customerName: 'Koffi Aya',
      pickupAddress: 'Yopougon, Zone 4',
      deliveryAddress: 'Marcory, Biétry',
      distance: 8.7,
      estimatedTime: '25 min',
      price: 2000,
      status: 'delivery',
      packageType: 'Documents urgents',
      pickupTime: '10:45',
      urgency: 'normal'
    }
  ])

  // Livraisons disponibles
  const [availableDeliveries, setAvailableDeliveries] = useState([
    {
      id: 'TBP-2024-003',
      customerName: 'Kouassi Paul',
      customerFullName: 'Kouassi Paul-Marie',
      customerEmail: 'paul.kouassi@email.com',
      customerPhone: '+225 01 02 03 04 05',
      pickupAddress: 'Abobo, Baoulé',
      deliveryAddress: 'Treichville, Boulevard Mitterrand',
      senderCoords: { lat: 5.4166, lon: -4.0166 },
      recipientCoords: { lat: 5.3094, lon: -4.0126 },
      distance: 12.3,
      estimatedTime: '35 min',
      price: 2500,
      packageType: 'Courses urgentes',
      designation: 'Vêtements',
      description: 'Un sac contenant des vêtements variés pour livraison express.',
      weight: 5,
      volume: 3.5,
      options: ['Fragile'],
      isFragile: true,
      deliveryType: 'Express 48h',
      urgency: 'high',
      customerRating: 4.5,
      packagePhoto: '/package_sample.png',
      vehicleType: 'moteur',
      feedback: {
        likes: 12,
        comments: [
          { driverName: 'Moussa D.', content: 'Client très ponctuel et sympathique.' },
          { driverName: 'Sery G.', content: 'Rien à signaler, parfait.' }
        ]
      }
    },
    {
      id: 'TBP-2024-004',
      customerName: 'Yao Esther',
      customerFullName: 'Yao Esther Grâce',
      customerEmail: 'e.yao@hotline.ci',
      customerPhone: '+225 05 06 07 08 09',
      pickupAddress: 'Plateau, Stade Général De Gaulle',
      deliveryAddress: 'Cocody, Angre',
      senderCoords: { lat: 5.3245, lon: -4.0123 },
      recipientCoords: { lat: 5.3789, lon: -3.9876 },
      distance: 6.8,
      estimatedTime: '20 min',
      price: 1800,
      packageType: 'Pharmacie & Santé',
      designation: 'Médicaments',
      description: 'Boîtes de médicaments à livrer d\'urgence.',
      weight: 1,
      volume: 0.1,
      options: ['Assurance'],
      isFragile: false,
      deliveryType: 'Standard 72h',
      urgency: 'urgent',
      customerRating: 4.9,
      packagePhoto: '/package_sample.png',
      vehicleType: 'velo',
      feedback: {
        likes: 45,
        comments: [
          { driverName: 'Koffi J.', content: 'Habituée, toujours au top.' },
          { driverName: 'Amani B.', content: 'Donne souvent des pourboires.' }
        ]
      }
    }
  ])

  const [selectedDelivery, setSelectedDelivery] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [activeRoute, setActiveRoute] = useState<any>(null)

  useEffect(() => {
    if (selectedDelivery && selectedDelivery.senderCoords && selectedDelivery.recipientCoords) {
      const fetchRoute = async () => {
        try {
          const route = await getRoute(
            selectedDelivery.senderCoords.lat,
            selectedDelivery.senderCoords.lon,
            selectedDelivery.recipientCoords.lat,
            selectedDelivery.recipientCoords.lon,
            selectedDelivery.vehicleType === 'velo' ? 'bike' : 'driving'
          );
          setActiveRoute(route);
        } catch (e) {
          console.error("Failed to fetch route", e);
          setActiveRoute(null);
        }
      };
      fetchRoute();
    } else {
      setActiveRoute(null);
    }
  }, [selectedDelivery]);

  // Données premium
  const isPremium = true
  const isMedium = true
  const premiumData = {
    tier: 'Gold',
    monthlyEarnings: 385000,
    completionRate: 98.5,
    averageResponseTime: '2 min',
    monthlyDeliveries: 127,
    bonusEarned: 45000,
    points: 2840,
    nextTierPoints: 3500,
    benefits: [
      'Accès prioritaire aux annonces',
      'Bonus de 15% sur chaque livraison',
      'Support client 24/7',
      'Assurance incluse',
      'Analyses détaillées'
    ],
    weeklyPerformance: [
      { day: 'Lun', deliveries: 18, earnings: 48000 },
      { day: 'Mar', deliveries: 22, earnings: 62000 },
      { day: 'Mer', deliveries: 15, earnings: 42000 },
      { day: 'Jeu', deliveries: 25, earnings: 71000 },
      { day: 'Ven', deliveries: 28, earnings: 83000 },
      { day: 'Sam', deliveries: 14, earnings: 45000 },
      { day: 'Dim', deliveries: 5, earnings: 34000 },
    ],
    monthlyEarningsEvolution: [
      { month: 'Jan', earnings: 320000, lastYear: 280000 },
      { month: 'Fév', earnings: 350000, lastYear: 310000 },
      { month: 'Mar', earnings: 385000, lastYear: 340000 },
      { month: 'Avr', earnings: 420000, lastYear: 360000 },
      { month: 'Mai', earnings: 450000, lastYear: 390000 },
      { month: 'Juin', earnings: 480000, lastYear: 410000 },
      { month: 'Juil', earnings: 460000, lastYear: 400000 },
      { month: 'Août', earnings: 430000, lastYear: 380000 },
      { month: 'Sep', earnings: 490000, lastYear: 420000 },
      { month: 'Oct', earnings: 520000, lastYear: 440000 },
      { month: 'Nov', earnings: 560000, lastYear: 470000 },
      { month: 'Déc', earnings: 385000, lastYear: 310000 },
    ],
    monthlyDeliveriesEvolution: [
      { month: 'Jan', deliveries: 98 },
      { month: 'Fév', deliveries: 112 },
      { month: 'Mar', deliveries: 127 },
      { month: 'Avr', deliveries: 138 },
      { month: 'Mai', deliveries: 145 },
      { month: 'Juin', deliveries: 158 },
      { month: 'Juil', deliveries: 152 },
      { month: 'Août', deliveries: 142 },
      { month: 'Sep', deliveries: 165 },
      { month: 'Oct', deliveries: 178 },
      { month: 'Nov', deliveries: 192 },
      { month: 'Déc', deliveries: 127 },
    ]
  }

  // availability toggle removed per UI request

  const handleAcceptDelivery = async (deliveryId: string) => {
    try {
      // Call frontend-only service (no backend changes)
      await acceptDeliveryService(deliveryId)

      // Move delivery from available to active in local UI state
      setAvailableDeliveries((prev) => prev.filter((d) => d.id !== deliveryId))
      const accepted = availableDeliveries.find((d) => d.id === deliveryId)
      if (accepted) {
        const now = { ...accepted, status: 'pickup' }
        setActiveDeliveries((prev) => [now, ...prev])
      }

      // switch to livraisons tab so the livreur voit sa nouvelle livraison
      setActiveTab('livraisons')

      toast({
        title: 'Annonce souscrite',
        description: `Vous avez souscrit à ${deliveryId}`,
      })
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'accepter la livraison pour le moment',
      })
    }
  }

  const handleStartDelivery = (deliveryId: string) => {
    // TODO: Implémenter la logique de démarrage de livraison
    console.log('Démarrage de la livraison:', deliveryId)
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
      case 'high':
        return <Badge variant="destructive" className="bg-red-500">Urgent</Badge>
      case 'normal':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Normal</Badge>
      default:
        return <Badge variant="outline">Standard</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pickup':
        return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300"><MapPin className="w-3 h-3 mr-1" /> En attente retrait</Badge>
      case 'delivery':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300"><Navigation className="w-3 h-3 mr-1" /> En livraison</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300"><CheckCircle2 className="w-3 h-3 mr-1" /> Livré</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  TiiB<span className="text-orange-500">n</span>Pick
                </h1>
                <p className="text-xs text-gray-500">Espace Livreur</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              {/* Notification Bell */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>

              {/* Profile Menu */}
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900">{livreurInfo.lastName} {livreurInfo.firstName}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600">{livreurInfo.rating}</span>
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>

              <Button variant="ghost" size="icon" className="text-red-600">
                <LogOut className="w-5 h-5" />
              </Button>
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <nav className="md:hidden border-t bg-white py-4 space-y-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => router.push('/livreur/profil')}>
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{livreurInfo.lastName} {livreurInfo.firstName}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600">{livreurInfo.rating}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/livreur/historique')}>
                <Calendar className="w-4 h-4 mr-2" />
                Historique des livraisons
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 p-4 sm:pb-24 lg:pb-24 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {activeTab === 'accueil' && (
            <>
              {/* Welcome Card */}
              <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Bienvenue,</p>
                      <h1 className="text-2xl md:text-3xl font-bold mb-2">{livreurInfo.lastName} {livreurInfo.firstName}</h1>
                      <p className="text-sm opacity-90">Bienvenue sur votre espace livreur</p>
                    </div>
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                      <Truck className="w-10 h-10" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3" />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions rapides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => setActiveTab('annonces')}
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:bg-orange-50"
                    >
                      <Megaphone className="w-8 h-8 text-orange-600" />
                      <span className="text-sm font-medium">Voir les annonces</span>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">{availableDeliveries.length}</Badge>
                    </Button>

                    <Button
                      onClick={() => setActiveTab('livraisons')}
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:bg-orange-50"
                    >
                      <Truck className="w-8 h-8 text-orange-600" />
                      <span className="text-sm font-medium">Livraisons actives</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">{activeDeliveries.length}</Badge>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Active Deliveries Preview */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-lg">Livraisons en cours</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('livraisons')}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    Voir tout
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeDeliveries.slice(0, 2).map((delivery) => (
                      <div key={delivery.id} className="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-gray-900">{delivery.id}</span>
                              {getStatusBadge(delivery.status)}
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div className="space-y-1 flex-1">
                                <p className="text-xs text-gray-700">
                                  <span className="font-medium">Retrait:</span> {delivery.pickupAddress}
                                </p>
                                <p className="text-xs text-gray-700">
                                  <span className="font-medium">Livraison:</span> {delivery.deliveryAddress}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          {isPremium && activeTab === 'dashboard' && (
            <>
              {/* Premium Header */}
              <Card className="bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Crown className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h1 className="text-2xl md:text-3xl font-bold">{livreurInfo.lastName} {livreurInfo.firstName}</h1>
                          <Award className="w-6 h-6 text-yellow-200" />
                        </div>
                        <p className="text-sm opacity-90 mt-1">Abonnement {premiumData.tier}</p>
                      </div>
                    </div>
                    <Badge className="bg-white/20 text-white border-2 border-white/40 text-sm px-4 py-2">
                      Premium
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-xs opacity-80 mb-1">Gains mensuels</p>
                      <p className="text-xl font-bold">{premiumData.monthlyEarnings.toLocaleString()} FCFA</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-xs opacity-80 mb-1">Livraisons</p>
                      <p className="text-xl font-bold">{premiumData.monthlyDeliveries}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-xs opacity-80 mb-1">Taux de réussite</p>
                      <p className="text-xl font-bold">{premiumData.completionRate}%</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-xs opacity-80 mb-1">Bonus gagnés</p>
                      <p className="text-xl font-bold">{premiumData.bonusEarned.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Chart */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                    Performance hebdomadaire
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {premiumData.weeklyPerformance.map((day) => (
                      <div key={day.day} className="flex items-center gap-4">
                        <div className="w-12 text-sm font-semibold text-gray-600">{day.day}</div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-lg transition-all duration-500"
                              style={{ width: `${(day.deliveries / 30) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right w-24">
                          <div className="text-sm font-semibold text-gray-900">{day.deliveries} liv.</div>
                          <div className="text-xs text-gray-500">{(day.earnings / 1000).toFixed(0)}k FCFA</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Earnings Evolution Chart */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Évolution des revenus mensuels
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <EarningsChart data={premiumData.monthlyEarningsEvolution} />
                </CardContent>
              </Card>

              {/* Deliveries Evolution Chart */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Évolution du nombre de livraisons
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <DeliveriesChart data={premiumData.monthlyDeliveriesEvolution} />
                </CardContent>
              </Card>

              {/* Year Comparison Chart */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                    Comparaison des revenus : Année précédente vs Année actuelle
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ComparisonChart data={premiumData.monthlyEarningsEvolution} />
                </CardContent>
              </Card>
            </>
          )}
          {!isPremium && activeTab === 'dashboard' && (
            <>
              {!isMedium ? (
                /* Upgrade to Premium Page */
                <div className="flex flex-col items-center justify-center min-h-[500px] px-4">
                  <Card className="w-full max-w-md text-center">
                    <CardContent className="p-8 space-y-6">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-4">
                        <Crown className="w-10 h-10 text-white" />
                      </div>
                      <div className="space-y-3">
                        <h2 className="text-2xl font-bold text-gray-900">Passez au Premium</h2>
                        <p className="text-gray-600">
                          Débloquez des fonctionnalités exclusives et augmentez vos revenus avec notre abonnement Premium
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="text-left">
                              <p className="font-semibold text-gray-900">Accès prioritaire aux annonces</p>
                              <p className="text-sm text-gray-600">Voyez les nouvelles livraisons en premier</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="text-left">
                              <p className="font-semibold text-gray-900">Bonus de 15% sur chaque livraison</p>
                              <p className="text-sm text-gray-600">Gagnez plus avec chaque course</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="text-left">
                              <p className="font-semibold text-gray-900">Analyses et statistiques détaillées</p>
                              <p className="text-sm text-gray-600">Suivez votre progression</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                      >
                        Voir les abonnements
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                /* Dashboard Standard for Medium accounts */
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3 px-4 py-3">
                        <CardDescription className="text-[10px] md:text-xs">Aujourd'hui</CardDescription>
                        <CardTitle className="text-xl md:text-2xl text-orange-600">{todayStats.deliveries}</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Package className="w-3 h-3 mr-1" />
                          Livraisons
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3 px-4 py-3">
                        <CardDescription className="text-[10px] md:text-xs">Revenus</CardDescription>
                        <CardTitle className="text-xl md:text-2xl text-green-600">{todayStats.earnings.toLocaleString()} FCFA</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Gains
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3 px-4 py-3">
                        <CardDescription className="text-[10px] md:text-xs">Distance</CardDescription>
                        <CardTitle className="text-xl md:text-2xl text-blue-600">{todayStats.distance} km</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapIcon className="w-3 h-3 mr-1" />
                          Parcourue
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3 px-4 py-3">
                        <CardDescription className="text-[10px] md:text-xs">Pourboires</CardDescription>
                        <CardTitle className="text-xl md:text-2xl text-purple-600">{todayStats.tips.toLocaleString()} FCFA</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Reçus
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Total Stats Card */}
                  <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Statistiques globales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="bg-white/10 rounded-lg p-4">
                          <p className="text-sm opacity-90 mb-1">Total livraisons</p>
                          <p className="text-2xl font-bold">{livreurInfo.totalDeliveries}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                          <p className="text-sm opacity-90 mb-1">Total gains</p>
                          <p className="text-2xl font-bold">{livreurInfo.totalEarnings.toLocaleString()} FCFA</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                          <p className="text-sm opacity-90 mb-1">Note moyenne</p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold">{livreurInfo.rating}</p>
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}

          {activeTab === 'annonces' && (
            <>
              <div className="grid lg:grid-cols-2 gap-4">
                {availableDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="border-2 border-orange-500 bg-orange-50 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{delivery.id}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-sm font-semibold text-yellow-700">{delivery.customerRating}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{delivery.customerName}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Retrait:</span> {delivery.pickupAddress}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Livraison:</span> {delivery.deliveryAddress}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <MapIcon className="w-4 h-4" />
                          <span>{delivery.distance} km</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{delivery.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">{delivery.price.toLocaleString()} FCFA</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                          onClick={() => { setSelectedDelivery(delivery); setDetailsOpen(true) }}
                        >
                          Voir Détails
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                          onClick={() => handleAcceptDelivery(delivery.id)}
                        >
                          Souscrire à l'annonce
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Dialog open={detailsOpen} onOpenChange={(o) => { setDetailsOpen(o); if (!o) { setSelectedDelivery(null); } }}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                          <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <DialogTitle className="text-xl">Détails de l'expédition</DialogTitle>
                          <DialogDescription className="font-mono text-orange-600">{selectedDelivery?.id}</DialogDescription>
                        </div>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                    {/* Colonne Gauche : Infos Trajet & Carte */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Lieu de Retrait</p>
                            <p className="text-sm text-gray-700">{selectedDelivery?.pickupAddress}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Lieu de Livraison</p>
                            <p className="text-sm text-gray-700">{selectedDelivery?.deliveryAddress}</p>
                          </div>
                        </div>
                      </div>

                      {/* Carte logic integration */}
                      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm h-64 relative z-0">
                        {selectedDelivery && selectedDelivery.senderCoords && (
                          <MapLeaflet
                            center={[
                              (selectedDelivery.senderCoords.lat + selectedDelivery.recipientCoords.lat) / 2,
                              (selectedDelivery.senderCoords.lon + selectedDelivery.recipientCoords.lon) / 2
                            ]}
                            zoom={12}
                            markers={[
                              { position: [selectedDelivery.senderCoords.lat, selectedDelivery.senderCoords.lon], label: "Retrait", color: "#f97316" },
                              { position: [selectedDelivery.recipientCoords.lat, selectedDelivery.recipientCoords.lon], label: "Livraison", color: "#10b981" }
                            ]}
                            route={activeRoute}
                          />
                        )}
                      </div>

                      <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                        <div className="flex items-center gap-2">
                          <MapIcon className="w-5 h-5 text-orange-600" />
                          <span className="font-bold">{selectedDelivery?.distance} km</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-orange-600" />
                          <span className="font-bold">{selectedDelivery?.estimatedTime}</span>
                        </div>
                        <div className="text-lg font-black text-orange-600">
                          {selectedDelivery?.price?.toLocaleString()} FCFA
                        </div>
                      </div>

                      {/* Section Client Profil & Avis */}
                      <div className="border-t pt-6">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">Profil du Client</h4>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                              {selectedDelivery?.customerFullName?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{selectedDelivery?.customerFullName}</p>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs font-semibold">{selectedDelivery?.customerRating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span>{selectedDelivery?.customerEmail}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{selectedDelivery?.customerPhone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Avis des autres livreurs */}
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-gray-900">Avis des Livreurs</h4>
                            <Badge variant="outline" className="flex items-center gap-1 border-orange-200 text-orange-700 bg-orange-50">
                              <Heart className="w-3 h-3 fill-current" />
                              {selectedDelivery?.feedback?.likes} likes
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            {selectedDelivery?.feedback?.comments.map((c: any, idx: number) => (
                              <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold">
                                    {c.driverName.charAt(0)}
                                  </div>
                                  <span className="text-xs font-bold text-gray-700">{c.driverName}</span>
                                </div>
                                <p className="text-xs text-gray-600 italic">"{c.content}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Colonne Droite : Infos Colis & Logistique */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3 border-b pb-1">Détails du Colis</h4>

                        {/* Photo du Colis */}
                        <div className="mb-4">
                          <div className="aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center relative group">
                            {selectedDelivery?.packagePhoto ? (
                              <img
                                src={selectedDelivery.packagePhoto}
                                alt="Colis"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-gray-400">
                                <Package className="w-8 h-8 opacity-20" />
                                <p className="text-xs">Aucune photo disponible</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                          <div>
                            <p className="text-xs text-gray-500">Désignation</p>
                            <p className="font-medium">{selectedDelivery?.designation}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Type de colis</p>
                            <p className="font-medium">{selectedDelivery?.packageType}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500">Description</p>
                            <p className="text-sm italic text-gray-600">{selectedDelivery?.description || 'Aucune description fournie'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Poids</p>
                            <p className="font-medium">{selectedDelivery?.weight} kg</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Logistique</p>
                            <p className="font-medium capitalize">{selectedDelivery?.deliveryType}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl space-y-4">
                        <p className="text-sm font-bold text-orange-800 dark:text-orange-300 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Options & Sécurité
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className={selectedDelivery?.isFragile ? "border-red-500 text-red-600 bg-red-50" : "opacity-30"}>Fragile</Badge>
                          <Badge variant="outline" className={selectedDelivery?.options?.includes('Périssable') ? "border-orange-500 text-orange-600 bg-orange-50" : "opacity-30"}>Périssable</Badge>
                          <Badge variant="outline" className={selectedDelivery?.options?.includes('Assurance') ? "border-green-500 text-green-600 bg-green-50" : "opacity-30"}>Assuré</Badge>
                        </div>
                      </div>


                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}

          {activeTab === 'livraisons' && (
            <>
              <div className="grid lg:grid-cols-2 gap-4 mb-6">
                {activeDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="border-2 border-orange-500 bg-orange-50 transition-shadow hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{delivery.id}</CardTitle>
                        </div>
                        {getStatusBadge(delivery.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Retrait:</span> {delivery.pickupAddress}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Livraison:</span> {delivery.deliveryAddress}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{delivery.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">{delivery.price.toLocaleString()} FCFA</span>
                        </div>
                      </div>

                      {delivery.status === 'delivery' ? (
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                        >
                          Continuer
                        </Button>
                      ) : (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            Annuler
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                            onClick={() => handleStartDelivery(delivery.id)}
                          >
                            Démarrer
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => setActiveTab('accueil')}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-all',
              activeTab === 'accueil' ? 'text-orange-600 font-bold' : 'text-gray-500'
            )}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px]">Accueil</span>
          </button>

          {(isPremium || isMedium) && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-all',
                activeTab === 'dashboard' ? 'text-orange-600 font-bold' : 'text-gray-500'
              )}
            >
              <LayoutDashboard className="w-6 h-6" />
              <span className="text-[10px]">Stats</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('annonces')}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-all',
              activeTab === 'annonces' ? 'text-orange-600 font-bold' : 'text-gray-500'
            )}
          >
            <Megaphone className="w-6 h-6" />
            <span className="text-[10px]">Annonces</span>
          </button>

          <button
            onClick={() => setActiveTab('livraisons')}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-all',
              activeTab === 'livraisons' ? 'text-orange-600 font-bold' : 'text-gray-500'
            )}
          >
            <Truck className="w-6 h-6" />
            <span className="text-[10px]">Livraisons</span>
          </button>
        </div>
      </nav>

      {/* Desktop Footer */}
      <footer className="hidden md:block py-6 bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 TiiBnTick - Espace Livreur • Disponible 24h/24</p>
        </div>
      </footer>
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export default withAuth(LivreurDashboard)
