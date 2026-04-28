"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ChefHat, Eye, EyeOff, Check, AlertCircle, Building2, User, Mail, Lock, Sparkles } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/ui/logo"
import { useI18n } from "@/components/i18n/i18n-provider"

function getPasswordStrength(
  password: string,
  t: (key: string) => string
) {
  let score = 0
  const feedback: string[] = []

  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push(t("register.valMin8"))
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push(t("register.valLower"))
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push(t("register.valUpper"))
  }

  if (/[0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push(t("register.valNumber"))
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push(t("register.valSpecial"))
  }

  return { score, feedback }
}

export default function RegisterPage() {
  const { t } = useI18n()
  const [formData, setFormData] = useState({
    restaurantName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError("") // Clear error when user types
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 50)
  }

  const passwordStrength = getPasswordStrength(formData.password, t)
  const isPasswordStrong = passwordStrength.score >= 4
  const isPasswordMatch = formData.password === formData.confirmPassword && formData.password !== ""

  const canProceedToStep2 = formData.restaurantName.trim() !== "" && 
                           formData.firstName.trim() !== "" && 
                           formData.lastName.trim() !== ""

  const canProceedToStep3 = formData.email.trim() !== "" && 
                           formData.email.includes("@") && 
                           isPasswordStrong && 
                           isPasswordMatch

  const handleNextStep = () => {
    if (currentStep === 1 && canProceedToStep2) {
      setCurrentStep(2)
    } else if (currentStep === 2 && canProceedToStep3) {
      setCurrentStep(3)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError(t("register.errPasswordsMismatch"))
      setIsLoading(false)
      return
    }

    if (!isPasswordStrong) {
      setError(t("register.errPasswordWeak"))
      setIsLoading(false)
      return
    }

    try {
      // First, sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: "owner",
          },
        },
      })

      if (authError) {
        setError(authError.message)
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        setError(t("register.errCreateUser"))
        setIsLoading(false)
        return
      }

      // Wait a moment for the auth session to be established
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Now create the restaurant
      const restaurantSlug = generateSlug(formData.restaurantName)

      // Check if slug already exists
      const { data: existingRestaurant } = await supabase
        .from("restaurants")
        .select("slug")
        .eq("slug", restaurantSlug)
        .single()

      const finalSlug = existingRestaurant ? `${restaurantSlug}-${Date.now()}` : restaurantSlug

      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .insert({
          name: formData.restaurantName,
          slug: finalSlug,
          is_active: true,
        })
        .select()
        .single()

      if (restaurantError) {
        console.error("Error creating restaurant:", restaurantError)
        console.error("Restaurant error details:", {
          message: restaurantError.message,
          details: restaurantError.details,
          hint: restaurantError.hint,
          code: restaurantError.code
        })
        setError(t("register.errCreateRestaurant", { message: restaurantError.message }))
        setIsLoading(false)
        return
      }

      // Create user record in our users table first
      const userInsertData = {
        id: authData.user.id,
        restaurant_id: restaurantData.id,
        email: formData.email,
        password_hash: "handled_by_supabase_auth",
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: "owner",
        is_active: true,
        has_completed_onboarding: false, // New users should see the tutorial
      }
      
      console.log("Attempting to insert user with data:", userInsertData)
      
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert(userInsertData)
        .select()
        .single()

      if (userError) {
        console.error("User record creation error:", userError)
        console.error("User error details:", {
          message: userError.message,
          details: userError.details,
          hint: userError.hint,
          code: userError.code,
          error: userError
        })
        console.error("User data that failed to insert:", {
          id: authData.user.id,
          restaurant_id: restaurantData.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: "owner"
        })
        setError("Failed to create user record: " + (userError.message || "Unknown error"))
        setIsLoading(false)
        return
      }

      // Note: Subscription management is now handled through the users table
      // The trial period is calculated dynamically based on created_at
      console.log("User registration completed successfully")

      // Show verification message instead of redirecting
      setShowVerificationMessage(true)
    } catch (err) {
      console.error("Registration error:", err)
      setError(t("register.errUnexpected"))
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            step <= currentStep 
              ? "bg-foreground border-foreground text-background" 
              : "bg-muted border-border text-muted-foreground"
          }`}>
            {step < currentStep ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="text-sm font-medium">{step}</span>
            )}
          </div>
          {step < 3 && (
            <div className={`w-12 h-0.5 mx-2 ${
              step < currentStep ? "bg-foreground" : "bg-muted"
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderVerificationMessage = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card">
        <Check className="h-8 w-8 text-foreground" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-medium text-foreground">
          {t("register.verifyCheckEmail")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("register.verifySent")}</p>
      </div>

      <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-left">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-medium">{t("register.verifyNext")}</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("register.verifyNextDesc")}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-border/90 bg-card p-4 text-left">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <h4 className="text-sm font-medium">{t("register.noEmail")}</h4>
            <p className="mt-1 text-xs text-muted-foreground">{t("register.noEmailDesc")}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => router.push("/auth/login")}
          className="h-11 w-full"
        >
          {t("register.goToLogin")}
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            setShowVerificationMessage(false)
            setCurrentStep(1)
            setFormData({
              restaurantName: "",
              firstName: "",
              lastName: "",
              email: "",
              password: "",
              confirmPassword: "",
            })
          }}
          className="h-11 w-full"
        >
          {t("register.createAnother")}
        </Button>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="w-5 h-5 text-foreground" />
              <h3 className="text-lg font-semibold text-foreground">
                {t("register.step1Title")}
              </h3>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="restaurantName" className="text-sm font-semibold text-foreground">
                {t("register.restaurantName")}
              </Label>
              <Input
                id="restaurantName"
                name="restaurantName"
                placeholder={t("register.restaurantNamePh")}
                value={formData.restaurantName}
                onChange={handleInputChange}
                required
                className="h-11 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="firstName" className="text-sm font-semibold text-foreground">
                  {t("register.firstName")}
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder={t("register.firstNamePh")}
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="h-11 transition-colors"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="lastName" className="text-sm font-semibold text-foreground">
                  {t("register.lastName")}
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder={t("register.lastNamePh")}
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="h-11 transition-colors"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Mail className="w-5 h-5 text-foreground" />
              <h3 className="text-lg font-semibold text-foreground">{t("register.step2Title")}</h3>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                {t("register.email")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("register.emailPh")}
                value={formData.email}
                onChange={handleInputChange}
                required
                className="h-11 transition-colors"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                {t("register.password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("register.passwordPh")}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="h-11 transition-colors pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          level <= passwordStrength.score
                            ? passwordStrength.score >= 4
                              ? "bg-green-500"
                              : passwordStrength.score >= 3
                              ? "bg-yellow-500"
                              : "bg-red-500"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {t("register.passwordStrength")}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        passwordStrength.score >= 4
                          ? "bg-green-100 text-green-700 border-green-200"
                          : passwordStrength.score >= 3
                          ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }`}
                    >
                      {passwordStrength.score >= 4
                        ? t("register.strong")
                        : passwordStrength.score >= 3
                          ? t("register.good")
                          : t("register.weak")}
                    </Badge>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>
                        {t("register.addPrefix")}: {passwordStrength.feedback.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                {t("register.confirmPassword")}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("register.confirmPasswordPh")}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={`h-11 transition-colors pr-12 ${
                    formData.confirmPassword && !isPasswordMatch ? "border-red-300 focus:border-red-500" : ""
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formData.confirmPassword && (
                <div className="flex items-center space-x-2">
                  {isPasswordMatch ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-xs ${isPasswordMatch ? "text-green-600" : "text-red-600"}`}>
                    {isPasswordMatch ? t("register.match") : t("register.noMatch")}
                  </span>
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-foreground" />
              <h3 className="text-lg font-semibold text-foreground">{t("register.step3Title")}</h3>
            </div>
            
            <div className="rounded-xl bg-muted/40 p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Restaurant:</span>
                <span className="text-sm font-medium text-foreground">{formData.restaurantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("register.reviewOwner")}:</span>
                <span className="text-sm font-medium text-foreground">{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("register.reviewEmail")}:</span>
                <span className="text-sm font-medium text-foreground">{formData.email}</span>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/25 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground">
                  <Check className="h-3 w-3 text-background" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    {t("register.readyTitle")}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">{t("register.readyDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground) / 0.06) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />
      
      <Card className="relative z-10 w-full max-w-lg border-border/90 bg-card shadow-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4 mt-4">
            <Logo size="2xl" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground mb-1">
            {showVerificationMessage ? t("register.titleVerify") : t("register.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {showVerificationMessage
              ? t("register.descriptionVerify")
              : t("register.description")}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          {showVerificationMessage ? (
            renderVerificationMessage()
          ) : (
            <>
              {renderStepIndicator()}
              
              <form onSubmit={handleRegister} className="space-y-6">
                {renderStepContent()}

                {/* Terms and Conditions Checkbox - Only show on final step */}
                {currentStep === 3 && (
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border border-input text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground">
                      {t("register.agreeTerms")}{" "}
                      <Link
                        href="/legal/terms"
                        target="_blank"
                        className="font-medium text-foreground underline underline-offset-2"
                      >
                        {t("register.terms")}
                      </Link>{" "}
                      {t("register.and")}{" "}
                      <Link
                        href="/legal/privacy"
                        target="_blank"
                        className="font-medium text-foreground underline underline-offset-2"
                      >
                        {t("register.privacy")}
                      </Link>
                    </label>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive"
                  >
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex space-x-3">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviousStep}
                      className="h-11 flex-1"
                    >
                      Previous
                    </Button>
                  )}
                  
                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      disabled={
                        (currentStep === 1 && !canProceedToStep2) ||
                        (currentStep === 2 && !canProceedToStep3)
                      }
                      className="h-11 flex-1"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      className="h-11 flex-1" 
                      disabled={isLoading || !acceptedTerms}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  )}
                </div>
              </form>
            </>
          )}

          {!showVerificationMessage && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {t("register.hasAccount")}{" "}
              <Link
                href="/auth/login"
                className="font-medium text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
              >
                {t("register.signIn")}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
