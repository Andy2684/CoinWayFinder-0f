"use client"

import { useRouter } from "next/router"
import { useState } from "react"

const SignupClient = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    // Code to handle signup logic here

    // Redirect to thank you page after successful signup
    router.push("/thank-you")
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        required
      />
      <button type="submit">Sign Up</button>
    </form>
  )
}

export default SignupClient
