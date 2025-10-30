import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectEntityById, updateEntityField } from '@/state/entitiesSlice'
import StarRating from '@/components/inputs/StarRating'

interface SalesReviewFieldProps {
  clientId: string
}

export function SalesReviewField({ clientId }: SalesReviewFieldProps) {
  const dispatch = useDispatch()
  const entity = useSelector(selectEntityById(clientId))
  const value = entity?.salesReview as number | undefined

  const handleChange = (newValue: number | undefined) => {
    dispatch(updateEntityField({ 
      id: clientId, 
      key: 'salesReview', 
      value: newValue 
    }) as any)
  }

  return (
    <StarRating 
      value={value} 
      onChange={handleChange}
    />
  )
}

interface RetentionReviewFieldProps {
  clientId: string
}

export function RetentionReviewField({ clientId }: RetentionReviewFieldProps) {
  const dispatch = useDispatch()
  const entity = useSelector(selectEntityById(clientId))
  const value = entity?.retentionReview as number | undefined

  const handleChange = (newValue: number | undefined) => {
    dispatch(updateEntityField({ 
      id: clientId, 
      key: 'retentionReview', 
      value: newValue 
    }) as any)
  }

  return (
    <StarRating 
      value={value} 
      onChange={handleChange}
    />
  )
}