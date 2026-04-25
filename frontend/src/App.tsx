/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Web3Provider } from './blockchain/Web3Provider';
import Verifier from './components/Verifier';

export default function App() {
  return (
    <Web3Provider>
      <Verifier />
    </Web3Provider>
  );
}

