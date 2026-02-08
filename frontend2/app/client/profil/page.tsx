'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Package,
  Calendar,
  Edit,
  LogOut,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Settings,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  Loader2
} from 'lucide-react'
import { withAuth } from '@/components/hoc/withAuth'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { updateClient, checkEmail, checkNationalId, deleteClient } from '@/services/clientService'

export function ClientProfile() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, login, logout, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    // Refresh user data from server on mount to ensure mobile-ready persistence
    refreshUser()
  }, [])

  // Real data from context
  const [clientData, setClientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    password: '',
    rating: 5.0,
    totalOrders: 0,
    memberSince: new Date().toISOString()
  })

  // editedData should be a subset of clientData for the form
  const [editedData, setEditedData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    password: '',
  })

  // Sync state when user is loaded
  useEffect(() => {
    if (user) {
      const initialData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        nationalId: user.nationalId || '',
        password: user.password || '123atanga',
        rating: user.rating || 5.0,
        totalOrders: 0,
        memberSince: user.memberSince || new Date().toISOString()
      }
      setClientData(initialData)
      setEditedData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        phone: initialData.phone,
        nationalId: initialData.nationalId,
        password: initialData.password,
      })
    }
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
    setEditedData({ ...clientData })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedData({ ...clientData })
  }

  const handleSave = async () => {
    // 1. Check for empty fields individually for a better user experience
    const missingFields = []
    if (!editedData.firstName) missingFields.push('Prénom')
    if (!editedData.lastName) missingFields.push('Nom')
    if (!editedData.email) missingFields.push('Email')
    if (!editedData.phone) missingFields.push('Téléphone')
    if (!editedData.nationalId) missingFields.push('Numéro CNI')
    if (!editedData.password) missingFields.push('Mot de passe')

    if (missingFields.length > 0) {
      toast({
        title: 'Champs obligatoires',
        description: `Veuillez remplir les champs suivants : ${missingFields.join(', ')}.`,
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      // 2. Validate email if it changed
      if (editedData.email !== clientData.email) {
        const emailExists = await checkEmail(editedData.email)
        if (emailExists) {
          toast({
            title: 'Email déjà utilisé',
            description: 'Cet email est déjà associé à un autre compte.',
            variant: 'destructive',
          })
          setIsLoading(false)
          return
        }
      }

      // 3. Validate CNI if it changed
      if (editedData.nationalId !== clientData.nationalId) {
        const nIdExists = await checkNationalId(editedData.nationalId)
        if (nIdExists) {
          toast({
            title: 'Numéro CNI déjà utilisé',
            description: 'Ce numéro de CNI est déjà associé à un autre compte.',
            variant: 'destructive',
          })
          setIsLoading(false)
          return
        }
      }

      // 4. Update in Backend
      if (user?.clientId) {
        await updateClient(user.clientId, editedData)

        // 5. Update local state and context TOGETHER
        const updatedClient = {
          ...clientData,
          ...editedData
        }

        const updatedUser = {
          ...user,
          ...editedData
        }

        setClientData(updatedClient)
        login(updatedUser)
        setIsEditing(false)

        toast({
          title: 'Succès ! ✅',
          description: 'Votre compte a été mis à jour avec succès.',
        })
      }
    } catch (error: any) {
      console.error('Update failed:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Une erreur est survenue.'
      toast({
        title: 'Échec de la mise à jour',
        description: errorMsg,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const handleDeleteAccount = async () => {
    if (!user?.clientId) return

    setIsLoading(true)
    try {
      await deleteClient(user.clientId)

      toast({
        title: 'Compte supprimé ✅',
        description: 'Votre compte a été définitivement supprimé. Au plaisir de vous revoir !',
      })

      // Lock the UI and start the redirect
      setIsRedirecting(true)

      // Manual cleanup and hard redirect is safer for mobile app transition
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      setTimeout(() => {
        window.location.replace('/')
      }, 500)
    } catch (error: any) {
      console.error('Deletion failed:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Une erreur est survenue lors de la suppression.'
      toast({
        title: 'Erreur',
        description: errorMsg,
        variant: 'destructive',
      })
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  // Safe date formatter helper
  const formatDate = (dateString?: string) => {
    if (!hasMounted || !dateString) return '...'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    } catch (e) {
      return '...'
    }
  }

  // Determine if we should show content or loader
  const showContent = hasMounted && user && clientData.email && !isRedirecting

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" suppressHydrationWarning>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-gray-700 hover:text-orange-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mon Profil</h1>
              <p className="text-sm text-gray-600">Gérez votre compte</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {!showContent ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Chargement de votre profil...</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Overview Card */}
            <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">{clientData.lastName} {clientData.firstName}</h2>
                    <div className="flex items-center gap-4 text-sm opacity-90">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{clientData.rating}</span>
                      </div>
                      <span>•</span>
                      <span>Membre depuis {formatDate(clientData.memberSince)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-600" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lastName">Nom {isEditing && <span className="text-red-500">*</span>}</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={editedData.lastName}
                        onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mt-1">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{clientData.lastName}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="firstName">Prénom {isEditing && <span className="text-red-500">*</span>}</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={editedData.firstName}
                        onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mt-1">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{clientData.firstName}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email {isEditing && <span className="text-red-500">*</span>}</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedData.email}
                        onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mt-1">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{clientData.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Téléphone {isEditing && <span className="text-red-500">*</span>}</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={editedData.phone}
                        onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mt-1">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{clientData.phone}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="nationalId">Numéro CNI {isEditing && <span className="text-red-500">*</span>}</Label>
                    {isEditing ? (
                      <Input
                        id="nationalId"
                        value={editedData.nationalId}
                        onChange={(e) => setEditedData({ ...editedData, nationalId: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mt-1">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{clientData.nationalId || 'Non renseigné'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password">Mot de passe {isEditing && <span className="text-red-500">*</span>}</Label>
                    {isEditing ? (
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={editedData.password}
                          onChange={(e) => setEditedData({ ...editedData, password: e.target.value })}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-600 transition-colors"
                          aria-label={showPassword ? "Masquer" : "Afficher"}
                        >
                          {showPassword ? <Eye key="eye-open" size={20} /> : <EyeOff key="eye-closed" size={20} />}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mt-1 relative pr-10 min-h-[52px]">
                        <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                        <span className="font-medium truncate">
                          {showPassword ? clientData.password : '********'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                          aria-label={showPassword ? "Masquer" : "Afficher"}
                        >
                          {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                    >
                      <span className="flex items-center justify-center gap-2 pointer-events-none">
                        {isLoading ? (
                          <Loader2 key="loader" className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 key="check" className="w-4 h-4" />
                        )}
                        <span className="font-medium">Enregistrer</span>
                      </span>
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-600" />
                  Actions du compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="w-full justify-start h-12 border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 text-orange-700"
                >
                  <Edit className="w-5 h-5 mr-3" />
                  <span className="font-medium">Modifier mon compte</span>
                </Button>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-start h-12 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span className="font-medium">Déconnexion</span>
                </Button>

                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="outline"
                  className="w-full justify-start h-12 border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 text-orange-600"
                >
                  <Trash2 className="w-5 h-5 mr-3" />
                  <span className="font-medium">Supprimer le compte</span>
                </Button>
              </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="max-w-md w-full border-2 border-orange-200">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-orange-900">Supprimer le compte ?</CardTitle>
                        <p className="text-sm text-orange-700 mt-1">Cette action est irréversible</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-6">
                      Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront définitivement perdues.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowDeleteDialog(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Non
                      </Button>
                      <Button
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Oui
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default withAuth(ClientProfile, ['CLIENT'])
