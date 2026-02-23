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
import { useRouter } from 'next/navigation'
import { acceptDelivery as acceptDeliveryService } from '@/services/deliveryService'
import dynamic from 'next/dynamic'
import { getRoute } from '@/services/routing'
import { useEffect, useCallback } from 'react'
import {
  getPublishedAnnouncements,
  getDeliveryPersonSubscriptions,
  AnnouncementResponseDTO
} from '@/services/announcementService'

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
import apiClient from '@/lib/axios'
import { cn } from '@/lib/utils'

export function LivreurDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('accueil')

  // Livreur info from context
  const livreurInfo = {
    firstName: user?.firstName || 'Livreur',
    lastName: user?.lastName || '',
    rating: user?.rating || 4.8,
    totalDeliveries: user?.totalDeliveries || 156,
    totalEarnings: 245000,
    phone: user?.phone || '+225 07 00 00 00 00'
  }


  // Available announcements from API
  const [availableDeliveries, setAvailableDeliveries] = useState<AnnouncementResponseDTO[]>([])
  const [availableLoading, setAvailableLoading] = useState(false)

  // Active deliveries (subscribed announcements) from API
  const [activeDeliveries, setActiveDeliveries] = useState<AnnouncementResponseDTO[]>([])
  const [activeLoading, setActiveLoading] = useState(false)

  const [selectedDelivery, setSelectedDelivery] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [activeRoute, setActiveRoute] = useState<any>(null)
  const [pendingSubscriptions, setPendingSubscriptions] = useState<Set<string>>(new Set())
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(() => {
    // Restore from localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('livreur_subscribed_ids');
        if (saved) return new Set(JSON.parse(saved));
      } catch (e) { /* ignore */ }
    }
    return new Set();
  })

  // Fetch published announcements
  const fetchAvailableDeliveries = useCallback(async () => {
    setAvailableLoading(true)
    try {
      const data = await getPublishedAnnouncements()
      // Only show PUBLISHED announcements (not ASSIGNED)
      setAvailableDeliveries(data.filter(a => a.status === 'PUBLISHED'))
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setAvailableLoading(false)
    }
  }, [])

  // Stable user ID for dependency (avoids re-fetching on every user object change)
  const deliveryPersonIdRef = user?.deliveryPersonId || user?.id

  // Fetch delivery person's subscriptions (active deliveries)
  const fetchMyDeliveries = useCallback(async () => {
    if (!deliveryPersonIdRef) return
    setActiveLoading(true)
    try {
      const data = await getDeliveryPersonSubscriptions(deliveryPersonIdRef)
      setActiveDeliveries(data)
      // Merge API subscription IDs into existing set (don't overwrite locally-added IDs)
      const apiIds = data.map(a => a.id)
      setSubscribedIds(prev => {
        const merged = new Set(prev)
        apiIds.forEach(id => merged.add(id))
        // Persist to localStorage
        try { localStorage.setItem('livreur_subscribed_ids', JSON.stringify([...merged])); } catch (e) { /* ignore */ }
        return merged
      })
    } catch (error) {
      console.error('Error fetching my deliveries:', error)
    } finally {
      setActiveLoading(false)
    }
  }, [deliveryPersonIdRef])

  useEffect(() => {
    fetchAvailableDeliveries()
    fetchMyDeliveries()
  }, [fetchAvailableDeliveries, fetchMyDeliveries])

  // Real-time notifications via SSE
  useEffect(() => {
    if (!user?.id) return;

    // Use relative path to go through Gateway and add token for authentication
    const token = localStorage.getItem('token');
    const eventSource = new EventSource(`/api/notifications/stream/${user.id}${token ? `?token=${token}` : ''}`);

    eventSource.onmessage = (event) => {
      try {
        const matchingEvent = JSON.parse(event.data);
        console.info('Received real-time matching notification:', matchingEvent);

        // Fetch announcement details to add to available deliveries
        apiClient.get(`/api/announcements/${matchingEvent.announcementId}`)
          .then(res => {
            const announcement = res.data;
            setAvailableDeliveries(prev => {
              if (prev.find(d => d.id === announcement.id)) return prev;
              return [announcement as AnnouncementResponseDTO, ...prev];
            });

            toast({
              title: "Nouvelle course disponible !",
              description: announcement.title || "Une nouvelle course correspond à votre position.",
            });
          });
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [user?.id]);

  useEffect(() => {
    if (
      selectedDelivery?.pickupAddress?.latitude &&
      selectedDelivery?.pickupAddress?.longitude &&
      selectedDelivery?.deliveryAddress?.latitude &&
      selectedDelivery?.deliveryAddress?.longitude
    ) {
      const fetchRoute = async () => {
        try {
          const route = await getRoute(
            selectedDelivery.pickupAddress.latitude,
            selectedDelivery.pickupAddress.longitude,
            selectedDelivery.deliveryAddress.latitude,
            selectedDelivery.deliveryAddress.longitude,
            selectedDelivery.transportMethod === 'bike' ? 'bike' : 'driving'
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


  // availability toggle removed per UI request

  const handleAcceptDelivery = async (deliveryId: string) => {
    if (!user?.id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour souscrire à une annonce.",
        variant: "destructive"
      });
      return;
    }

    setPendingSubscriptions(prev => {
      const next = new Set(prev);
      next.add(deliveryId);
      return next;
    });

    try {
      const response = await apiClient.post(`/api/announcements/${deliveryId}/subscribe`, {
        deliveryPersonId: user.deliveryPersonId || user.id
      });

      if (response.status === 200 || response.status === 201 || response.status === 202) {
        setSubscribedIds(prev => {
          const next = new Set(prev);
          next.add(deliveryId);
          // Persist to localStorage
          try { localStorage.setItem('livreur_subscribed_ids', JSON.stringify([...next])); } catch (e) { /* ignore */ }
          return next;
        });
        // Clean up pending state
        setPendingSubscriptions(prev => {
          const next = new Set(prev);
          next.delete(deliveryId);
          return next;
        });
        toast({
          title: "Demande envoyée",
          description: "Votre demande de souscription est en cours de traitement.",
        })
      } else {
        setPendingSubscriptions(prev => {
          const next = new Set(prev);
          next.delete(deliveryId);
          return next;
        });
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer la demande de souscription.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setPendingSubscriptions(prev => {
        const next = new Set(prev);
        next.delete(deliveryId);
        return next;
      });
      toast({
        title: "Erreur",
        description: "Une erreur réseau est survenue.",
        variant: "destructive",
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
                  TiiB<span className="text-orange-500">n</span>Tick
                </h1>
                <p className="text-xs text-gray-500">Espace Livreur</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              {/* Notification Bell */}
              <Button variant="ghost" size="icon" className="relative opacity-50 cursor-not-allowed" disabled>
                <Bell className="w-5 h-5" />
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

              <Button variant="ghost" size="icon" className="opacity-50 cursor-not-allowed" disabled>
                <Settings className="w-5 h-5" />
              </Button>

              <Button variant="ghost" size="icon" className="text-red-600" onClick={logout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative opacity-50 cursor-not-allowed" disabled>
                <Bell className="w-5 h-5" />
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
              <Button variant="ghost" className="w-full justify-start opacity-50 cursor-not-allowed" disabled>
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </Button>
              <Button variant="ghost" className="w-full justify-start opacity-50 cursor-not-allowed" disabled>
                <Calendar className="w-4 h-4 mr-2" />
                Historique des livraisons
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-600" onClick={logout}>
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
                      {availableLoading ? null : (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">{availableDeliveries.length}</Badge>
                      )}
                    </Button>

                    <Button
                      onClick={() => setActiveTab('livraisons')}
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:bg-orange-50"
                    >
                      <Truck className="w-8 h-8 text-orange-600" />
                      <span className="text-sm font-medium">Mes livraisons</span>
                      {activeLoading ? null : (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">{activeDeliveries.length}</Badge>
                      )}
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
                    {activeDeliveries.length === 0 ? (
                      <div className="text-center py-8">
                        <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Aucune livraison en cours</p>
                        <p className="text-xs text-gray-400 mt-1">Souscrivez à une annonce pour commencer</p>
                      </div>
                    ) : (
                      activeDeliveries.slice(0, 2).map((delivery) => (
                        <div key={delivery.id} className="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-gray-900">{delivery.title}</span>
                                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                                  <Package className="w-3 h-3 mr-1" />
                                  {delivery.status === 'ASSIGNED' ? 'Assignée' : 'Souscrit'}
                                </Badge>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                <div className="space-y-1 flex-1">
                                  <p className="text-xs text-gray-700">
                                    <span className="font-medium">Retrait:</span> {delivery.pickupAddress?.city || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-700">
                                    <span className="font-medium">Livraison:</span> {delivery.deliveryAddress?.city || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'annonces' && (
            <>
              <div className="grid lg:grid-cols-2 gap-4">
                {availableLoading ? (
                  <div className="col-span-2 flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : availableDeliveries.length === 0 ? (
                  <div className="col-span-2 text-center py-16">
                    <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune annonce disponible</h3>
                    <p className="text-sm text-gray-500">Revenez plus tard pour voir les nouvelles annonces</p>
                  </div>
                ) : availableDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow rounded-xl">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{delivery.title}</CardTitle>
                          <p className="text-[10px] text-orange-600 font-medium italic">
                            {delivery.pickupAddress?.city || 'N/A'} → {delivery.deliveryAddress?.city || 'N/A'}
                          </p>
                        </div>
                        {delivery.amount && (
                          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                            <DollarSign className="w-3 h-3 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">{delivery.amount.toLocaleString()} FCFA</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {delivery.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">{delivery.description}</p>
                      )}
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Retrait:</span> {delivery.pickupAddress?.street || delivery.pickupAddress?.city || 'N/A'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Livraison:</span> {delivery.deliveryAddress?.street || delivery.deliveryAddress?.city || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
                        {delivery.distance && (
                          <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4" />
                            <span>{delivery.distance.toFixed(1)} km</span>
                          </div>
                        )}
                        {delivery.amount && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-600">{delivery.amount.toLocaleString()} FCFA</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                          onClick={() => { setSelectedDelivery(delivery); setDetailsOpen(true) }}
                        >
                          Voir les détails
                        </Button>
                        <Button
                          size="sm"
                          disabled={pendingSubscriptions.has(delivery.id) || subscribedIds.has(delivery.id)}
                          className={cn(
                            "flex-1 shadow-md transform active:scale-95 transition-all text-white font-medium",
                            (pendingSubscriptions.has(delivery.id) || subscribedIds.has(delivery.id))
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                          )}
                          onClick={() => handleAcceptDelivery(delivery.id)}
                        >
                          {(pendingSubscriptions.has(delivery.id) || subscribedIds.has(delivery.id))
                            ? "En attente de traitement"
                            : "Souscrire à l'annonce"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Dialog open={detailsOpen} onOpenChange={(o) => { setDetailsOpen(o); if (!o) { setSelectedDelivery(null); } }}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl">{selectedDelivery?.title || "Détails de l'annonce"}</DialogTitle>
                        <DialogDescription className="text-xs font-mono text-orange-600">{selectedDelivery?.id}</DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                    {/* Left Column: Route Info & Map */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Lieu de Retrait</p>
                            <p className="text-sm text-gray-700">
                              {selectedDelivery?.pickupAddress?.street && `${selectedDelivery.pickupAddress.street}, `}
                              {selectedDelivery?.pickupAddress?.district && `${selectedDelivery.pickupAddress.district}, `}
                              {selectedDelivery?.pickupAddress?.city || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Lieu de Livraison</p>
                            <p className="text-sm text-gray-700">
                              {selectedDelivery?.deliveryAddress?.street && `${selectedDelivery.deliveryAddress.street}, `}
                              {selectedDelivery?.deliveryAddress?.district && `${selectedDelivery.deliveryAddress.district}, `}
                              {selectedDelivery?.deliveryAddress?.city || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Map */}
                      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm h-64 relative z-0">
                        {selectedDelivery?.pickupAddress?.latitude && selectedDelivery?.deliveryAddress?.latitude && (
                          <MapLeaflet
                            center={[
                              (selectedDelivery.pickupAddress.latitude + selectedDelivery.deliveryAddress.latitude) / 2,
                              (selectedDelivery.pickupAddress.longitude + selectedDelivery.deliveryAddress.longitude) / 2
                            ]}
                            zoom={12}
                            markers={[
                              { position: [selectedDelivery.pickupAddress.latitude, selectedDelivery.pickupAddress.longitude], label: "Retrait", color: "#f97316" },
                              { position: [selectedDelivery.deliveryAddress.latitude, selectedDelivery.deliveryAddress.longitude], label: "Livraison", color: "#10b981" }
                            ]}
                            route={activeRoute}
                          />
                        )}
                      </div>

                      <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                        {selectedDelivery?.distance && (
                          <div className="flex items-center gap-2">
                            <Navigation className="w-5 h-5 text-orange-600" />
                            <span className="font-bold">{selectedDelivery.distance.toFixed(1)} km</span>
                          </div>
                        )}
                        {selectedDelivery?.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-600" />
                            <span className="font-bold">{Math.round(selectedDelivery.duration)} min</span>
                          </div>
                        )}
                        {selectedDelivery?.amount && (
                          <div className="text-lg font-black text-orange-600">
                            {selectedDelivery.amount.toLocaleString()} FCFA
                          </div>
                        )}
                      </div>

                      {/* Transport & Payment info */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {selectedDelivery?.transportMethod && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Mode de transport</p>
                            <p className="font-medium capitalize">{selectedDelivery.transportMethod}</p>
                          </div>
                        )}
                        {selectedDelivery?.paymentMethod && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Paiement</p>
                            <p className="font-medium capitalize">{selectedDelivery.paymentMethod}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Description, Packet & Recipient */}
                    <div className="space-y-4">
                      {selectedDelivery?.description && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2">Description</h4>
                          <p className="text-sm text-gray-600">{selectedDelivery.description}</p>
                        </div>
                      )}

                      {/* Packet Details */}
                      {selectedDelivery?.packet && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3 border-b pb-1">Détails du Colis</h4>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                            {selectedDelivery.packet.designation && (
                              <div>
                                <p className="text-xs text-gray-500">Désignation</p>
                                <p className="font-medium">{selectedDelivery.packet.designation}</p>
                              </div>
                            )}
                            {selectedDelivery.packet.weight && (
                              <div>
                                <p className="text-xs text-gray-500">Poids</p>
                                <p className="font-medium">{selectedDelivery.packet.weight} kg</p>
                              </div>
                            )}
                            {selectedDelivery.packet.length && selectedDelivery.packet.width && selectedDelivery.packet.height && (
                              <div className="col-span-2">
                                <p className="text-xs text-gray-500">Dimensions (L × l × H)</p>
                                <p className="font-medium">{selectedDelivery.packet.length} × {selectedDelivery.packet.width} × {selectedDelivery.packet.height} cm</p>
                              </div>
                            )}
                            {selectedDelivery.packet.description && (
                              <div className="col-span-2">
                                <p className="text-xs text-gray-500">Description du colis</p>
                                <p className="text-sm italic text-gray-600">{selectedDelivery.packet.description}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Recipient Info */}
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">Destinataire</h4>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl space-y-2">
                          {(selectedDelivery?.recipientFirstName || selectedDelivery?.recipientLastName) && (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                {selectedDelivery?.recipientFirstName?.charAt(0) || '?'}
                              </div>
                              <p className="font-bold text-gray-900">{selectedDelivery?.recipientFirstName} {selectedDelivery?.recipientLastName}</p>
                            </div>
                          )}
                          {selectedDelivery?.recipientPhone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{selectedDelivery.recipientPhone}</span>
                            </div>
                          )}
                          {selectedDelivery?.recipientEmail && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span>{selectedDelivery.recipientEmail}</span>
                            </div>
                          )}
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
              {activeLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : activeDeliveries.length === 0 ? (
                <div className="text-center py-16">
                  <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune livraison</h3>
                  <p className="text-sm text-gray-500">Souscrivez à une annonce pour voir vos livraisons ici</p>
                  <Button
                    className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500"
                    onClick={() => setActiveTab('annonces')}
                  >
                    Voir les annonces
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 mb-6">
                  {activeDeliveries.map((delivery) => (
                    <Card key={delivery.id} className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow rounded-xl">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base">{delivery.title}</CardTitle>
                            <p className="text-[10px] text-gray-400 italic">
                              {delivery.pickupAddress?.city || 'N/A'} → {delivery.deliveryAddress?.city || 'N/A'}
                            </p>
                          </div>
                          <Badge variant="outline" className={cn(
                            delivery.status === 'ASSIGNED'
                              ? 'bg-green-100 text-green-700 border-green-300'
                              : 'bg-orange-100 text-orange-700 border-orange-300'
                          )}>
                            {delivery.status === 'ASSIGNED' ? (
                              <><CheckCircle2 className="w-3 h-3 mr-1" /> Assignée</>
                            ) : (
                              <><Package className="w-3 h-3 mr-1" /> Souscrit</>
                            )}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {delivery.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">{delivery.description}</p>
                        )}
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Retrait:</span> {delivery.pickupAddress?.street || delivery.pickupAddress?.city || 'N/A'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full" />
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Livraison:</span> {delivery.deliveryAddress?.street || delivery.deliveryAddress?.city || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
                          {delivery.distance && (
                            <div className="flex items-center gap-2">
                              <Navigation className="w-4 h-4" />
                              <span>{delivery.distance.toFixed(1)} km</span>
                            </div>
                          )}
                          {delivery.amount && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-semibold text-green-600">{delivery.amount.toLocaleString()} FCFA</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main >

      {/* Bottom Navigation */}
      < nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50" >
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
      </nav >

      {/* Desktop Footer */}
      < footer className="hidden md:block py-6 bg-white border-t border-gray-100 mt-auto" >
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 TiiBnTick - Espace Livreur • Disponible 24h/24</p>
        </div>
      </footer >
    </div >
  )
}

export default withAuth(LivreurDashboard, ['LIVREUR'])
