"use client"

import React, { useState } from "react"
import { Eye, EyeOff, Shield, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { login as loginService } from "@/services/authService"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!email || !password) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await loginService(email, password)
      setSuccess(true)

      // Use AuthContext to store user and token
      login(response)

      setTimeout(() => {
        if (response.userType === 'ADMIN') {
          router.replace('/admin')
        } else if (response.userType === 'CLIENT') {
          router.replace('/client')
        } else if (response.userType === 'LIVREUR') {
          if (response.isActive) {
            router.replace('/livreur')
          } else {
            setSuccess(false)
            toast({
              title: "Activation requise",
              description: "Votre compte livreur n'est pas encore activé. Veuillez patienter ou contacter le support.",
              variant: "destructive"
            })
          }
        }
      }, 1000)
    } catch (err: any) {
      toast({
        title: "Échec de connexion",
        description: err.message || "Email ou mot de passe invalide.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e6] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1e2a4a] mb-2">Connexion</h1>
          <p className="text-[#5a6b8a]">Accédez à votre espace de gestion</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-lg flex items-center gap-3 animate-pulse">
            <CheckCircle2 className="shrink-0" size={20} />
            <p className="text-sm font-medium">Authentification réussie !</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#1e2a4a] mb-2"
            >
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#1e2a4a] mb-2"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-600 transition-colors"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3.5 rounded-lg transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-sm text-gray-500">Pas encore de compte ?</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Create Account Button */}
        <Link
          href="/inscription"
          className="w-full border border-gray-300 text-[#1e2a4a] font-medium py-3.5 rounded-lg hover:bg-gray-50 transition-colors block text-center"
        >
          Créer un compte
        </Link>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 mt-6 text-gray-400 text-sm">
          <Shield size={16} />
          <span>Connexion sécurisée</span>
        </div>
      </div>
    </div>
  )
}
