import { useDispatch, useSelector } from 'react-redux';

// Sử dụng hooks này thay vì useDispatch và useSelector thông thường
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
