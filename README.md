# Development of a Visualization Dashboard for On-Chain Crypto Asset Metrics Using Open APIs

A TypeScript/React + Vite-based web application for visualizing real-time and historical cryptocurrency metrics from blockchain data sources.

## Project Overview

This diploma project presents a comprehensive dashboard solution for monitoring and analyzing on-chain cryptocurrency metrics. The system fetches, processes, and visualizes financial data from trusted public APIs, providing users with actionable insights into blockchain network health and asset performance.

---

## Supported Metrics

### Transaction & Network Metrics
- **Number of Transactions** - Daily, hourly, and real-time transaction counts
- **Active Addresses** - Count of unique active addresses in defined periods
- **Hash Rate** - Network computational power (PoW chains)
- **Fees** - Transaction fee statistics and trends
- **Block Interval** - Average block creation time
- **Mempool Size** - Pending transaction pool volume

### Market & Distribution Metrics
- **Wallet Distribution** - Address concentration and wealth distribution analysis
- **Exchange Inflow/Outflow** - Asset movements to/from exchanges
- **NVT Ratio** - Network Value to Transaction ratio (valuation metric)
- **Realized Capitalization** - Capitalization based on last transaction price

---

## Security Architecture

### Protected Assets
- **API Data** - Raw responses from blockchain data providers
- **User Preferences** - Dashboard configuration and custom settings
- **Dashboard State** - Session data and visualization parameters
- **API Responses** - Cached and processed metric data
- **Deployed Frontend** - Production application assets

### Potential Threats
| Threat | Description |
|--------|-------------|
| **API Manipulation** | Compromised API responses returning false data |
| **MITM (Man-in-the-Middle)** | Network-level interception and modification |
| **XSS (Cross-Site Scripting)** | Malicious script injection through user inputs |
| **Malicious JSON Payloads** | Corrupted or malformed API responses |
| **Rate-Limit Abuse** | API quota exhaustion attacks |
| **Dependency Attacks** | Compromised npm packages or libraries |
| **Fake API Response** | Spoofed responses from untrusted sources |
| **Client-Side Tampering** | Modification of data in browser storage or memory |

### Security Measures Implemented
- **HTTPS/TLS** - End-to-end encrypted communication
- **Content Security Policy (CSP)** - Prevention of XSS and injection attacks
- **Input Validation** - Strict validation of all user and API inputs
- **Dependency Audit** - Regular npm audit and supply chain verification
- **Secure Headers** - X-Frame-Options, X-Content-Type-Options, etc.
- **API Response Validation** - Schema validation against expected data structures
- **Error Handling** - Secure error messages without exposing sensitive information
- **Integrity Checks** - Cryptographic verification of critical data

---

## Data Integrity Analysis

### Critical Requirements for Financial Metrics
Given the financial nature of cryptocurrency metrics, the following data integrity principles are enforced:

#### 1. **Source Authentication**
```
✓ API responses verified against known-good endpoints
✓ SSL/TLS certificate pinning for critical API providers
✓ DNSSEC validation for API domains
✓ Response signature verification (where available)
```

#### 2. **Transmission Integrity**
```
✓ HTTPS enforced (no HTTP fallback)
✓ API response checksums and signatures validated
✓ Timestamp verification to detect replay attacks
✓ Nonce inclusion for duplicate detection
```

#### 3. **Data Normalization**
```
✓ Standardized decimal precision (8 decimal places for crypto)
✓ Timezone normalization (all times to UTC)
✓ Unit conversion validation (satoshis → BTC, wei → ETH, etc.)
✓ Exchange rate normalization for multi-chain comparisons
```

#### 4. **Visualization Integrity**
```
✓ Display value == Original value verification
✓ No rounding errors in calculations
✓ Data transformation audit logs
✓ Chart rendering validation
```

#### 5. **Data Flow Integrity Checks**
| Stage | Validation Method |
|-------|-------------------|
| **API Fetch** | HTTPS + TLS pinning + timestamp validation |
| **Response Parsing** | JSON schema validation + type checking |
| **Normalization** | Decimal precision verification + unit conversion tests |
| **Storage** | Integrity hash computation and verification |
| **Display** | Value transformation audit trail |

---

## System Limitations

### Performance Constraints
- API rate limits (requests/minute vary by provider)
- WebSocket connection limits for real-time data
- Browser memory constraints for historical data storage
- Network latency impact on real-time metric freshness

### Data Availability
- Historical data availability depends on API provider archives
- Real-time metrics subject to API uptime (typically 99%+ SLA)
- Geographic data distribution may lag current status
- Mempool data limited to active node observation windows

### Accuracy Considerations
- NVT Ratio calculations subject to transaction value estimation
- Realized Cap based on available UTXO tracking data
- Exchange flows dependent on exchange withdrawal/deposit tagging
- Active Address counts affected by batching and aggregation

### Browser & Client Limitations
- Local storage limited to ~5-10MB per domain
- IndexedDB limits vary by browser (typically 50MB+)
- Real-time updates subject to browser tab background throttling
- Mobile devices may have reduced data update frequency

---

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS (see language composition)
- **API Communication**: Fetch API with error handling
- **State Management**: React Context / Hooks
- **Testing**: Unit and integration tests with security validation

## Language Composition

| Language | Percentage |
|----------|-----------|
| TypeScript | 98% |
| CSS | 1.4% |
| Other | 0.6% |

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Security Guidelines for Development

1. Always validate API responses against expected schemas
2. Never store sensitive API keys in client-side code
3. Use environment variables for API endpoints
4. Implement comprehensive error logging without exposing details
5. Regularly audit dependencies for vulnerabilities
6. Test with malformed and oversized payloads
7. Implement rate-limiting on client-side to respect API quotas

---

## Contributing & Deployment

- All contributions must include security review
- Dependency updates require audit verification
- Production deployments use subresource integrity (SRI) for external assets
- API endpoints must support CORS with explicit origin validation

---

## License

This diploma project is provided as-is for educational purposes.

**Last Updated**: May 28, 2026
