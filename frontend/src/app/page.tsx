'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, User, ArrowRight, Truck } from 'lucide-react'

export default function SelectionPage() {
  const router = useRouter()

  const handleAdminAccess = () => {
    router.push('/admin')
  }

  const handleClientAccess = () => {
    router.push('/client')
  }

  const handleLivreurAccess = () => {
    router.push('/livreur')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="w-full bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">
              TiiB<span className="text-orange-500">n</span>Pick
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Bienvenue sur TiiBnPick
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choisissez votre espace pour continuer
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Super Admin Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-orange-500">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Espace Super Admin
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Gérez les inscriptions des livreurs, les comptes utilisateurs et supervisez toute la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleAdminAccess}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-6 text-lg"
                >
                  Accéder à l'Admin
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Client Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-orange-500">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <User className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Espace Client
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Trouvez un livreur pour vos besoins : repas, courses, documents, pharmacie et plus encore
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleClientAccess}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-6 text-lg"
                >
                  Accéder en tant que Client
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Livreur Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-orange-500">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Espace Livreur
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Gérez vos livraisons, consultez vos revenus et gérez votre disponibilité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleLivreurAccess}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg"
                >
                  Accéder en tant que Livreur
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm border">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">
                Plateforme opérationnelle • Services disponibles 24h/24
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 TiiBnPick. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
