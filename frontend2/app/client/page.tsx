'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const MapLeaflet = dynamic(() => import('@/components/MapLeaflet'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-100 animate-pulse rounded-xl" />
});
import {
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Menu,
  X,
  Package,
  Megaphone,
  Truck,
  Bell,
  Home,
  MessageSquare,
  User,
  Calendar,
  MapPin as MapPinIcon,
  LogOut,
  DollarSign,
  MapIcon,
  Plus
} from 'lucide-react'
import { withAuth } from '@/components/hoc/withAuth'
import { useAuth } from '@/context/AuthContext'

export function ClientLanding() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [activeTab, setActiveTab] = useState('accueil')
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [myAnnouncements, setMyAnnouncements] = useState([
    {
      id: 'TBP-CLIENT-001',
      senderName: 'Marie Kouassi',
      senderPhone: '699001122',
      senderAddress: 'Quartier Bastos, Yaoundé',
      senderCoords: { lat: 3.8767, lon: 11.5122 },
      recipientName: 'Jean Dupont',
      recipientPhone: '677889900',
      recipientAddress: 'Douala, Centre-ville',
      recipientCoords: { lat: 4.0511, lon: 9.7679 },
      pickupAddress: 'Quartier Bastos, Yaoundé',
      deliveryAddress: 'Douala, Centre-ville',
      distance: 25.5,
      estimatedTime: '45 min',
      price: 5000,
      packageType: 'Courses urgentes',
      designation: 'Vêtements',
      description: 'Sac de vêtements variés pour dons',
      weight: 3,
      dimensions: { length: 40, width: 30, height: 20 },
      isFragile: false,
      isPerishable: false,
      isInsured: true,
      declaredValue: '50000',
      deliveryType: 'Express 48h',
      urgency: 'high',
      published: true
    },
    {
      id: 'TBP-CLIENT-002',
      senderName: 'Marie Kouassi',
      senderPhone: '699001122',
      senderAddress: 'Plateau, Stade Général De Gaulle',
      senderCoords: { lat: 5.3245, lon: -4.0123 },
      recipientName: 'Sophie Amiand',
      recipientPhone: '0505050505',
      recipientAddress: 'Cocody, Angre',
      recipientCoords: { lat: 5.3789, lon: -3.9876 },
      pickupAddress: 'Plateau, Stade Général De Gaulle',
      deliveryAddress: 'Cocody, Angre',
      distance: 6.8,
      estimatedTime: '20 min',
      price: 1800,
      packageType: 'Documents',
      designation: 'Papiers importants',
      description: 'Dossier administratif urgent',
      weight: 0.5,
      dimensions: { length: 30, width: 21, height: 2 },
      isFragile: false,
      isPerishable: false,
      isInsured: false,
      declaredValue: '0',
      deliveryType: 'Standard 72h',
      urgency: 'normal',
      published: false
    }
  ])

  // Fonction pour publier une annonce
  const handlePublishAnnouncement = (id: string) => {
    setMyAnnouncements((prev) =>
      prev.map((ann) =>
        ann.id === id ? { ...ann, published: true } : ann
      )
    )
  }

  // Fonction pour supprimer une annonce
  const handleDeleteAnnouncement = (id: string) => {
    setMyAnnouncements((prev) => prev.filter((ann) => ann.id !== id))
  }

  // Fonction pour mettre à jour une annonce
  const handleUpdateAnnouncement = (updatedAnn: any) => {
    setMyAnnouncements((prev) =>
      prev.map((ann) => (ann.id === updatedAnn.id ? updatedAnn : ann))
    );
    setSelectedAnnouncement(updatedAnn);
    setIsEditing(false);
  };

  // Client info from context
  const clientInfo = {
    firstName: user?.firstName || 'Client',
    lastName: user?.lastName || '',
    rating: user?.rating || 4.6,
    totalOrders: user?.totalDeliveries || 0
  }

  const steps = [
    {
      number: '01',
      title: 'Publiez',
      description: 'Décrivez votre besoin et publiez votre annonce gratuite'
    },
    {
      number: '02',
      title: 'Choisissez',
      description: 'Comparez les profils, prix et avis des livreurs'
    },
    {
      number: '03',
      title: 'Livraison',
      description: 'Suivez en temps réel et recevez à votre porte'
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                TiiB<span className="text-amber-500">n</span>Pick
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium">
                Tarifs
              </Button>
              <Button variant="ghost" className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium">
                Comment ça marche
              </Button>
              <Button variant="ghost" size="icon" onClick={logout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <LogOut className="w-5 h-5" />
              </Button>
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium shadow-md">
                <MapPin className="w-4 h-4 mr-2" />
                Commander
              </Button>
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 relative"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <nav className="md:hidden border-t border-gray-100 bg-white py-4 space-y-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => router.push('/client/profil')}>
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{clientInfo.lastName} {clientInfo.firstName}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600">{clientInfo.rating}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" className="w-full justify-start">
                <MapPinIcon className="w-4 h-4 mr-2" />
                Mes adresses
              </Button>
              <Button variant="ghost" className="w-full justify-start">
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
      <main className="flex-1">
        {/* Announcements Section */}
        {activeTab === 'annonces' && (
          <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Mes Annonces</h2>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold"
                  onClick={() => router.push('/expedition')}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter une annonce
                </Button>
              </div>
              <div className="grid lg:grid-cols-2 gap-4">
                {myAnnouncements.map((announcement) => (
                  <Card key={announcement.id} className="border-2 border-orange-500 bg-orange-50 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{announcement.id}</CardTitle>
                        </div>
                        <Badge variant={announcement.published ? "default" : "secondary"} className={announcement.published ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}>
                          {announcement.published ? "Publiée" : "Non publiée"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Retrait:</span> {announcement.pickupAddress}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Livraison:</span> {announcement.deliveryAddress}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <MapIcon className="w-4 h-4" />
                          <span>{announcement.distance} km</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{announcement.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">{announcement.price.toLocaleString()} FCFA</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => { setSelectedAnnouncement(announcement); setDetailsOpen(true) }}
                        >
                          Voir Détails
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-500 text-red-600 hover:bg-red-100"
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                        >
                          Supprimer
                        </Button>
                        {!announcement.published && (
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                            onClick={() => handlePublishAnnouncement(announcement.id)}
                          >
                            Publier
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Dialog open={detailsOpen} onOpenChange={(o) => { setDetailsOpen(o); if (!o) { setSelectedAnnouncement(null); setIsEditing(false); } }}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                          <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <DialogTitle className="text-xl">Détails de l'annonce</DialogTitle>
                          <DialogDescription className="font-mono text-orange-600">{selectedAnnouncement?.id}</DialogDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={isEditing ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (isEditing) {
                              const designation = (document.getElementById('edit-designation') as HTMLInputElement)?.value;
                              const description = (document.getElementById('edit-description') as HTMLTextAreaElement)?.value;
                              handleUpdateAnnouncement({
                                ...selectedAnnouncement,
                                designation: designation || selectedAnnouncement.designation,
                                description: description || selectedAnnouncement.description
                              });
                            } else {
                              setIsEditing(true);
                            }
                          }}
                          className={isEditing ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                        >
                          {isEditing ? "Enregistrer" : "Modifier"}
                        </Button>
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
                            <p className="text-xs text-gray-500 uppercase font-bold">Point de Retrait (Expéditeur)</p>
                            <p className="font-semibold">{selectedAnnouncement?.senderName}</p>
                            <p className="text-sm text-gray-600">{selectedAnnouncement?.senderPhone}</p>
                            <p className="text-sm text-gray-500">{selectedAnnouncement?.pickupAddress}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Point de Livraison (Destinataire)</p>
                            <p className="font-semibold">{selectedAnnouncement?.recipientName}</p>
                            <p className="text-sm text-gray-600">{selectedAnnouncement?.recipientPhone}</p>
                            <p className="text-sm text-gray-500">{selectedAnnouncement?.deliveryAddress}</p>
                          </div>
                        </div>
                      </div>

                      {/* Carte */}
                      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm h-64 relative z-0">
                        {selectedAnnouncement && selectedAnnouncement.senderCoords && (
                          <MapLeaflet
                            center={[
                              (selectedAnnouncement.senderCoords.lat + selectedAnnouncement.recipientCoords.lat) / 2,
                              (selectedAnnouncement.senderCoords.lon + selectedAnnouncement.recipientCoords.lon) / 2
                            ]}
                            zoom={10}
                            markers={[
                              { position: [selectedAnnouncement.senderCoords.lat, selectedAnnouncement.senderCoords.lon], label: "Retrait", color: "#f97316" },
                              { position: [selectedAnnouncement.recipientCoords.lat, selectedAnnouncement.recipientCoords.lon], label: "Livraison", color: "#10b981" }
                            ]}
                          />
                        )}
                      </div>

                      <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                        <div className="flex items-center gap-2">
                          <MapIcon className="w-5 h-5 text-orange-600" />
                          <span className="font-bold">{selectedAnnouncement?.distance} km</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-orange-600" />
                          <span className="font-bold">{selectedAnnouncement?.estimatedTime}</span>
                        </div>
                        <div className="text-lg font-black text-orange-600">
                          {selectedAnnouncement?.price?.toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>

                    {/* Colonne Droite : Infos Colis & Logistique */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3 border-b pb-1">Détails du Colis</h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                          <div>
                            <p className="text-xs text-gray-500">Désignation</p>
                            {isEditing ? (
                              <Input id="edit-designation" defaultValue={selectedAnnouncement?.designation} className="h-8 text-sm" />
                            ) : (
                              <p className="font-medium">{selectedAnnouncement?.designation}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Type de colis</p>
                            <p className="font-medium">{selectedAnnouncement?.packageType}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500">Description</p>
                            {isEditing ? (
                              <textarea id="edit-description" className="w-full text-sm border rounded-md p-2 h-20 bg-transparent" defaultValue={selectedAnnouncement?.description} />
                            ) : (
                              <p className="text-sm italic text-gray-600">{selectedAnnouncement?.description}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Poids</p>
                            <p className="font-medium">{selectedAnnouncement?.weight} kg</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Dimensions (Lxlxh)</p>
                            <p className="font-medium">
                              {selectedAnnouncement?.dimensions?.length}x{selectedAnnouncement?.dimensions?.width}x{selectedAnnouncement?.dimensions?.height} cm
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3 border-b pb-1">Options & Logistique</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className={selectedAnnouncement?.isFragile ? "border-red-500 text-red-600 bg-red-50" : "opacity-30"}>Fragile</Badge>
                          <Badge variant="outline" className={selectedAnnouncement?.isPerishable ? "border-orange-500 text-orange-600 bg-orange-50" : "opacity-30"}>Périssable</Badge>
                          <Badge variant="outline" className={selectedAnnouncement?.isInsured ? "border-green-500 text-green-600 bg-green-50" : "opacity-30"}>
                            Assuré ({selectedAnnouncement?.declaredValue} FCFA)
                          </Badge>
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Logistique</p>
                          <p className="text-sm font-medium">{selectedAnnouncement?.deliveryType}</p>
                          <p className="text-xs text-blue-500 mt-1">Urgence : {selectedAnnouncement?.urgency === 'high' ? 'Haute' : 'Normale'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </section>
        )}

        {/* Hero and How It Works Section */}
        {activeTab === 'accueil' && (
          <>

            <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 py-16 sm:py-24 lg:py-32">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-100 to-transparent opacity-50 rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-100 to-transparent opacity-30 rounded-full -translate-x-1/3 translate-y-1/3"></div>

              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Left Content */}
                  <div className="text-center lg:text-left">
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                      Vous avez un besoin ?
                      <span className="block text-orange-600">Trouvez votre livreur</span>
                    </h2>

                    <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl">
                      Postez votre annonce et choisissez parmi nos centaines de livreurs disponibles. Repas, courses, documents, colis, pharmacie ou service personnalisé.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-8 shadow-xl shadow-orange-500/20 text-base h-12"
                        onClick={() => {
                          // Pré-remplir le formulaire d'expédition avec quelques infos client basiques
                          try {
                            const expeditionPrefill = {
                              currentStep: 1,
                              senderData: {
                                senderName: `${clientInfo.lastName} ${clientInfo.firstName}`,
                                senderPhone: '',
                                senderEmail: '',
                                senderCountry: 'cameroun',
                                senderRegion: 'centre',
                                senderCity: 'Yaoundé',
                                senderAddress: '',
                                senderLieuDit: ''
                              },
                              recipientData: {
                                recipientName: '', recipientPhone: '', recipientEmail: '', recipientCountry: 'cameroun', recipientRegion: 'centre', recipientCity: 'Yaoundé', recipientAddress: '', recipientLieuDit: ''
                              },
                              packageData: {
                                photo: null, designation: '', description: '', weight: '', length: '', width: '', height: '',
                                isFragile: false, isPerishable: false, isLiquid: false, isInsured: false, declaredValue: '',
                                transportMethod: '', logistics: 'standard', pickup: false, delivery: false
                              },
                              routeData: { departurePointId: null, arrivalPointId: null, departurePointName: '', arrivalPointName: '', distanceKm: 0 },
                              signatureData: { signatureUrl: null },
                              pricing: { basePrice: 0, travelPrice: 0, operatorFee: 0, totalPrice: 0 }
                            };

                            localStorage.setItem('expedition_form_in_progress', JSON.stringify(expeditionPrefill));
                          } catch (e) { console.error('Erreur préfill expedition', e); }

                          router.push('/expedition');
                        }}
                      >
                        <Megaphone className="w-5 h-5 mr-2" />
                        Publier une annonce
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold px-8 h-12 text-base"
                        onClick={() => router.push('/inscription?role=livreur&step=2')}
                      >
                        <Truck className="w-5 h-5 mr-2" />
                        Devenir livreur
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-6 mt-8 justify-center lg:justify-start">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-700 font-medium">Suivi en temps réel</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-700 font-medium">Paiement sécurisé</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-gray-700 font-medium">Service client 24/7</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Content - Tracking */}
                  <div className="hidden lg:block">
                    <Card className="shadow-2xl border-2 border-orange-100 bg-white">
                      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <MapPin className="w-6 h-6 text-orange-600" />
                          Suivre une livraison
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="tracking" className="text-base font-semibold text-gray-800 mb-2">
                              Numéro de suivi
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id="tracking"
                                placeholder="Entrez votre numéro"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                className="flex-1 text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                              />
                              <Button size="icon" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                                <ArrowRight className="w-5 h-5" />
                              </Button>
                            </div>
                          </div>

                          <div className="text-sm text-gray-500">
                            Exemple: TBP-2024-XXXXXXX
                          </div>

                          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-4 py-3 rounded-lg">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">Dernière livraison il y a 5 minutes</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Comment ça marche ?
                  </h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    En seulement 3 étapes simples
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {steps.map((step, index) => (
                    <div key={index} className="relative">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full text-white text-2xl font-bold shadow-lg mb-6">
                          {step.number}
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">
                          {step.title}
                        </h4>
                        <p className="text-gray-600">
                          {step.description}
                        </p>
                      </div>

                      {/* Connector Line */}
                      {index < steps.length - 1 && (
                        <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-orange-200 to-transparent"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-around py-3">
            <button
              onClick={() => setActiveTab('accueil')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${activeTab === 'accueil' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'
                }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">Accueil</span>
            </button>

            <button
              onClick={() => setActiveTab('annonces')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${activeTab === 'annonces' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'
                }`}
            >
              <Megaphone className="w-6 h-6" />
              <span className="text-xs font-medium">Annonces</span>
            </button>

            <button
              onClick={() => setActiveTab('reponses')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${activeTab === 'reponses' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'
                }`}
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-xs font-medium">Réponses</span>
            </button>

            <button
              onClick={() => setActiveTab('livraisons')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${activeTab === 'livraisons' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'
                }`}
            >
              <Package className="w-6 h-6" />
              <span className="text-xs font-medium">Livraisons</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default withAuth(ClientLanding, ['CLIENT'])
