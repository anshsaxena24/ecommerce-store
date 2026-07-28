import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../hooks/useAuth'
import styles from './AuthPage.module.css'

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
})

export default function LoginPage() {
  const { login, token } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema)
  })

  if (token) return <Navigate to="/" replace />

  const onSubmit = async (data) => {
    setApiError('')
    try {
      await login(data)
      navigate('/')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Invalid email or password')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to your account</p>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input {...register('email')} type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="you@example.com" />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input {...register('password')} type="password" className={`form-input ${errors.password ? 'error' : ''}`} placeholder="••••••••" />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account? <Link to="/register" className={styles.link}>Create one</Link>
        </p>

        <div className={styles.demo}>
          <p className={styles.demoTitle}>Demo accounts:</p>
          <p>Admin: admin@store.com / admin123</p>
          <p>User: user1@store.com / user123</p>
        </div>
      </div>
    </div>
  )
}
