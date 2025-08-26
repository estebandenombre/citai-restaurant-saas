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


export default function RegisterPage() {
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

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let score = 0
    let feedback = []

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push("At least 8 characters")
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push("Lowercase letter")
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push("Uppercase letter")
    }

    if (/[0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push("Number")
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push("Special character")
    }

    return { score, feedback }
  }

  const passwordStrength = getPasswordStrength(formData.password)
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
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (!isPasswordStrong) {
      setError("Password is not strong enough")
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
        setError("Failed to create user account")
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
        setError("Failed to create restaurant: " + restaurantError.message)
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
      setError("An unexpected error occurred")
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
              ? "bg-[#7C3AED] border-[#7C3AED] text-white" 
              : "bg-gray-100 border-gray-300 text-gray-400"
          }`}>
            {step < currentStep ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="text-sm font-medium">{step}</span>
            )}
          </div>
          {step < 3 && (
            <div className={`w-12 h-0.5 mx-2 ${
              step < currentStep ? "bg-[#7C3AED]" : "bg-gray-300"
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderVerificationMessage = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-gray-900">Account Created Successfully!</h3>
        <p className="text-gray-600">
          We've sent a verification link to your email address.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
            <Mail className="w-3 h-3 text-white" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-medium text-blue-900">Verify your email address</h4>
            <p className="text-xs text-blue-700 mt-1">
              Check your inbox and click the verification link to activate your account.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
            <AlertCircle className="w-3 h-3 text-white" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-medium text-yellow-900">Didn't receive the email?</h4>
            <p className="text-xs text-yellow-700 mt-1">
              Check your spam folder or request a new verification link.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => router.push("/auth/login")}
          className="w-full h-11 bg-gradient-to-r from-[#7C3AED] to-[#D64DD2] hover:from-[#6B21A8] hover:to-[#C2185B] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Go to Login
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
          className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Create Another Account
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
              <Building2 className="w-5 h-5 text-[#7C3AED]" />
              <h3 className="text-lg font-semibold text-gray-900">Restaurant Information</h3>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="restaurantName" className="text-sm font-semibold text-gray-700">
                Restaurant Name
              </Label>
              <Input
                id="restaurantName"
                name="restaurantName"
                placeholder="Enter your restaurant name"
                value={formData.restaurantName}
                onChange={handleInputChange}
                required
                className="h-11 border-gray-200 focus:border-[#7C3AED] focus:ring-[#7C3AED] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="h-11 border-gray-200 focus:border-[#7C3AED] focus:ring-[#7C3AED] transition-colors"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="h-11 border-gray-200 focus:border-[#7C3AED] focus:ring-[#7C3AED] transition-colors"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Mail className="w-5 h-5 text-[#7C3AED]" />
              <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="h-11 border-gray-200 focus:border-[#7C3AED] focus:ring-[#7C3AED] transition-colors"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="h-11 border-gray-200 focus:border-[#7C3AED] focus:ring-[#7C3AED] transition-colors pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-600"
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
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">Password strength:</span>
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
                      {passwordStrength.score >= 4 ? "Strong" : passwordStrength.score >= 3 ? "Good" : "Weak"}
                    </Badge>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Add: {passwordStrength.feedback.join(", ")}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={`h-11 border-gray-200 focus:border-[#7C3AED] focus:ring-[#7C3AED] transition-colors pr-12 ${
                    formData.confirmPassword && !isPasswordMatch ? "border-red-300 focus:border-red-500" : ""
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-600"
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
                    {isPasswordMatch ? "Passwords match" : "Passwords don't match"}
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
              <Sparkles className="w-5 h-5 text-[#7C3AED]" />
              <h3 className="text-lg font-semibold text-gray-900">Review & Create</h3>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Restaurant:</span>
                <span className="text-sm font-medium text-gray-900">{formData.restaurantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Owner:</span>
                <span className="text-sm font-medium text-gray-900">{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium text-gray-900">{formData.email}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Ready to create your restaurant!</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Your account will be created with all the features you need to manage your restaurant efficiently.
                  </p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-coral-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-coral-50/50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#7C3AED]/20 to-[#D64DD2]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#FF6B6B]/20 to-[#7C3AED]/20 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-lg bg-white/90 backdrop-blur-sm border-0 shadow-2xl relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4 mt-4">
            <Logo size="2xl" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
            {showVerificationMessage ? "Email Verification Required" : "Create Your Restaurant"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {showVerificationMessage 
              ? "Complete your email verification to continue" 
              : "Set up your restaurant management account in 3 simple steps"
            }
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
                      className="mt-1 w-4 h-4 text-[#7C3AED] bg-gray-100 border-gray-300 rounded focus:ring-[#7C3AED] focus:ring-2"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the{" "}
                      <Link href="/legal/terms" target="_blank" className="text-[#7C3AED] hover:text-[#6B21A8] font-medium">
                        Terms and Conditions
                      </Link>
                      {" "}and{" "}
                      <Link href="/legal/privacy" target="_blank" className="text-[#7C3AED] hover:text-[#6B21A8] font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                )}

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-4 rounded-lg flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex space-x-3">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviousStep}
                      className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
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
                      className="flex-1 h-11 bg-gradient-to-r from-[#7C3AED] to-[#D64DD2] hover:from-[#6B21A8] hover:to-[#C2185B] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      className="flex-1 h-11 bg-gradient-to-r from-[#7C3AED] to-[#D64DD2] hover:from-[#6B21A8] hover:to-[#C2185B] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
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
            <div className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#7C3AED] hover:text-[#6B21A8] font-medium transition-colors">
                Sign in
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
