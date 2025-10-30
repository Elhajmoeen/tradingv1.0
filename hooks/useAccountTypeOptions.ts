import { useSelector } from 'react-redux';
import { selectAccountTypeOptions } from '@/state/accountTypesSlice';

export const useAccountTypeOptions = () => useSelector(selectAccountTypeOptions);