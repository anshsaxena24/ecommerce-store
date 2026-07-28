import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../hooks/useAuth'
import styles from './AuthPage.module.css'

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
})

export default function RegisterPage() {
  const { login, token } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema)
  })

  if (token) return <Navigate to="/" replace />

  const onSubmit = async ({ confirmPassword, ...data }) => {
    setApiError('')
    try {
      const authService = (await import('../services/authService')).default
      const result = await authService.register(data)
      localStorage.setItem('token', result.token)
      await login({ email: data.email, password: data.password })
      navigate('/')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Join ShopZone today</p>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.row}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input {...register('firstName')} className={`form-input ${errors.firstName ? 'error' : ''}`} placeholder="Alice" />
              {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input {...register('lastName')} className={`form-input ${errors.lastName ? 'error' : ''}`} placeholder="Smith" />
              {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input {...register('email')} type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="you@example.com" />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input {...register('password')} type="password" className={`form-input ${errors.password ? 'error' : ''}`} placeholder="At least 6 characters" />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input {...register('confirmPassword')} type="password" className={`form-input ${errors.confirmPassword ? 'error' : ''}`} placeholder="Repeat password" />
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
