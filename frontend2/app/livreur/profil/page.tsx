'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Star,
  Edit,
  LogOut,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { withAuth } from '@/components/hoc/withAuth'
import { useAuth } from '@/context/AuthContext'
import { updateDeliveryPerson, deleteDeliveryPerson } from '@/services/deliveryPersonService'

export function LivreurProfile() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, login, logout, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  // State for the edit form
  const [editedData, setEditedData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '********'
  })

  useEffect(() => {
    setHasMounted(true)
    refreshUser()
  }, [])

  // Prepare form data when entering edit mode OR when user updates
  useEffect(() => {
    if (user && !isEditing) {
      setEditedData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '********'
      })
    }
  }, [user, isEditing])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset data from context
    if (user) {
      setEditedData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '********'
      })
    }
  }

  const handleSave = async () => {
    const missingFields = []
    if (!editedData.firstName) missingFields.push('Prénom')
    if (!editedData.lastName) missingFields.push('Nom')
    if (!editedData.email) missingFields.push('Email')
    if (!editedData.phone) missingFields.push('Téléphone')

    if (missingFields.length > 0) {
      toast({
        title: 'Champs obligatoires',
        description: `Veuillez remplir : ${missingFields.join(', ')}.`,
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      if (user?.deliveryPersonId) {
        // Prepare data for update: if password is still '********', don't send it
        const updateData = { ...editedData }
        if (updateData.password === '********') {
          delete (updateData as any).password
        }

        await updateDeliveryPerson(user.deliveryPersonId, updateData)

        // Optimistically update the UI by updating the context locally
        // This ensures the dashboard and profile UI update INSTANTLY even before refreshUser finishes
        const updatedLocalUser = {
          ...user,
          ...editedData,
          // Don't overwrite with '********'
          password: updateData.password || user.password
        }
        login(updatedLocalUser)

        // Then refresh from server to ensure data consistency
        await refreshUser()

        setIsEditing(false)

        toast({
          title: 'Succès ! ✅',
          description: 'Votre profil a été mis à jour avec succès.',
        })
      }
    } catch (error: any) {
      console.error('Update failed:', error)
      toast({
        title: 'Échec de la mise à jour',
        description: error.response?.data?.message || 'Une erreur est survenue.',
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
    if (!user?.deliveryPersonId) return

    setIsLoading(true)
    try {
      await deleteDeliveryPerson(user.deliveryPersonId)
      toast({
        title: 'Compte supprimé ✅',
        description: 'Votre compte a été supprimé. À bientôt !',
      })
      logout()
    } catch (error: any) {
      console.error('Deletion failed:', error)
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de supprimer le compte.',
        variant: 'destructive',
      })
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!hasMounted || !dateString) return '...'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    } catch {
      return '...'
    }
  }

  // Use values directly from 'user' context for display to ensure reactivity
  const displayFirstName = user?.firstName || '...'
  const displayLastName = user?.lastName || ''
  const displayEmail = user?.email || '...'
  const displayPhone = user?.phone || '...'
  const displayRating = user?.rating || 5.0
  const displayTotalDeliveries = user?.totalDeliveries || 0
  const displayMemberSince = user?.memberSince || new Date().toISOString()
  const displayPassword = showPassword ? (user?.password || '********') : '********'

  const showContent = hasMounted && user

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
              <p className="text-sm text-gray-600">Gérez votre compte livreur</p>
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
                    <h2 className="text-2xl font-bold mb-1">{displayLastName} {displayFirstName}</h2>
                    <div className="flex items-center gap-4 text-sm opacity-90">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{displayRating}</span>
                      </div>
                      <span>•</span>
                      <span>{displayTotalDeliveries} livraisons</span>
                      <span>•</span>
                      <span>Membre depuis {formatDate(displayMemberSince)}</span>
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
                        <span className="font-medium">{displayLastName}</span>
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
                        <span className="font-medium">{displayFirstName}</span>
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
                        <span className="font-medium">{displayEmail}</span>
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
                        <span className="font-medium">{displayPhone}</span>
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
                        >
                          {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mt-1 relative pr-10 min-h-[52px]">
                        <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                        <span className="font-medium truncate">
                          {displayPassword}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
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
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      Enregistrer
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
                  onClick={handleEdit}
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
                      Êtes-vous sûr de vouloir supprimer votre compte ? Toutes vos données seront définitivement perdues.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowDeleteDialog(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Oui, supprimer
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

export default withAuth(LivreurProfile, ['LIVREUR'])
