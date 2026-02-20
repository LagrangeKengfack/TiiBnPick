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
  const [pendingSubscriptions, setPendingSubscriptions] = useState<Set<string>>(new Set())

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
              const mapped = mapBackendToFrontend(announcement);
              return [mapped, ...prev];
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

  const mapBackendToFrontend = (ann: any) => ({
    id: ann.id,
    customerName: ann.shipperFirstName + ' ' + ann.shipperLastName,
    customerFullName: ann.shipperFirstName + ' ' + ann.shipperLastName,
    customerEmail: ann.shipperEmail,
    customerPhone: ann.shipperPhone,
    pickupAddress: ann.pickupAddress ? `${ann.pickupAddress.street}, ${ann.pickupAddress.city}` : 'Adresse de retrait',
    deliveryAddress: ann.deliveryAddress ? `${ann.deliveryAddress.street}, ${ann.deliveryAddress.city}` : 'Adresse de livraison',
    senderCoords: { lat: ann.pickupAddress?.latitude, lon: ann.pickupAddress?.longitude },
    recipientCoords: { lat: ann.deliveryAddress?.latitude, lon: ann.deliveryAddress?.longitude },
    distance: ann.distance || 0,
    estimatedTime: ann.duration ? `${ann.duration} min` : 'N/A',
    price: ann.amount || 0,
    packageType: ann.packet?.designation || 'Colis',
    designation: ann.packet?.designation,
    description: ann.packet?.description,
    weight: ann.packet?.weight,
    options: ([ann.packet?.fragile ? 'Fragile' : null, ann.packet?.isPerishable ? 'Périssable' : null].filter(Boolean) as string[]),
    isFragile: ann.packet?.fragile,
    deliveryType: ann.transportMethod || 'Standard',
    urgency: ann.status === 'PUBLISHED' ? 'normal' : 'urgent',
    dimensions: `${ann.packet?.length || 0}x${ann.packet?.width || 0}x${ann.packet?.height || 0}`,
    volume: (ann.packet?.length || 0) * (ann.packet?.width || 0) * (ann.packet?.height || 0),
    customerRating: 4.5, // Mocked as not in DTO
    packagePhoto: ann.packet?.photoPacket || '/package_sample.png',
    vehicleType: 'moteur', // Default
    feedback: {
      likes: 12,
      comments: [
        { driverName: 'Moussa D.', content: 'Client très ponctuel et sympathique.' },
        { driverName: 'Sery G.', content: 'Rien à signaler, parfait.' }
      ]
    }
  });

  useEffect(() => {
    // Initial fetch of available announcements
    const fetchAnnouncements = async () => {
      try {
        const res = await apiClient.get('/api/announcements');
        const data = res.data;
        const enriched = data.filter((a: any) => a.status === 'PUBLISHED').map(mapBackendToFrontend);
        setAvailableDeliveries(enriched);
      } catch (e) {
        console.error("Failed to fetch announcements", e);
      }
    };
    fetchAnnouncements();
  }, []);

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
        deliveryPersonId: user.id
      });

      if (response.status === 200 || response.status === 201) {
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

          {activeTab === 'annonces' && (
            <>
              <div className="grid lg:grid-cols-2 gap-4">
                {availableDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="border-2 border-orange-500 bg-orange-50 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base font-mono">{delivery.id}</CardTitle>
                          <p className="text-[10px] text-orange-600 font-medium italic">{delivery.deliveryAddress}</p>
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
                          Voir les détails
                        </Button>
                        <Button
                          size="sm"
                          disabled={pendingSubscriptions.has(delivery.id)}
                          className={cn(
                            "flex-1 shadow-md transform active:scale-95 transition-all text-white font-medium",
                            pendingSubscriptions.has(delivery.id)
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                          )}
                          onClick={() => handleAcceptDelivery(delivery.id)}
                        >
                          {pendingSubscriptions.has(delivery.id)
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
                          <CardTitle className="text-base">{delivery.customerName || delivery.id}</CardTitle>
                          <p className="text-[10px] text-gray-400 font-mono italic">{delivery.id}</p>
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

export default withAuth(LivreurDashboard, ['LIVREUR'])
