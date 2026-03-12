'use client'

import { useState, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ data: null, loading: true, error: null })
      try {
        const result = await apiFunction(...args)
        setState({ data: result, loading: false, error: null })
        return result
      } catch (error: any) {
        const errorMessage = error.message || 'An error occurred'
        setState({ data: null, loading: false, error: errorMessage })
        return null
      }
    },
    [apiFunction]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return { ...state, execute, reset }
}

// API helper functions
export const api = {
  async get<T>(url: string, params?: Record<string, string>): Promise<T> {
    const searchParams = params
      ? '?' + new URLSearchParams(params).toString()
      : ''
    const response = await fetch(`/api${url}${searchParams}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Request failed')
    }
    return response.json()
  },

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`/api${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Request failed')
    }
    return response.json()
  },

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`/api${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Request failed')
    }
    return response.json()
  },

  async delete<T>(url: string): Promise<T> {
    const response = await fetch(`/api${url}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Request failed')
    }
    return response.json()
  },
}
