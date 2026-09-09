import { PageMotion } from '../components/PageMotion';
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Header, Footer, ScrollToTop } from '../components/Layout';
import { captureInitialAcquisition } from '../services/acquisition';
import { AppRoutes } from './router';

function AcquisitionCapture(){
  useEffect(()=>{captureInitialAcquisition();},[]);
  return null;
}

export function App(){return <BrowserRouter><AcquisitionCapture/><ScrollToTop/><Header/><PageMotion><AppRoutes/></PageMotion><Footer/></BrowserRouter>}
