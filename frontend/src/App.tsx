import { Routes, Route } from 'react-router-dom';
import { Web3Provider } from './components/Web3Provider';
import { Layout } from './components/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { VerifyCertificate } from './components/VerifyCertificate';
import { IssueCertificate } from './components/IssueCertificate';
import { RevokeCertificate } from './components/RevokeCertificate';
import { PublicVerify } from './components/PublicVerify';

import { useState, useEffect } from 'react';

import { Dashboard } from './components/Dashboard';

export default function App() {
  return (
    <Web3Provider>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route path="/public-verify" element={<PublicVerify />} />
            <Route path="/issue" element={<IssueCertificate />} />
            <Route path="/revoke" element={<RevokeCertificate />} />
            {/* Additional routes would go here */}
          </Routes>
        </AnimatePresence>
      </Layout>
    </Web3Provider>
  );
}

