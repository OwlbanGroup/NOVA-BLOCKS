# NOVA BLOCKS Scope Consolidation Plan

## Information Gathered

### Current Product Claims (from docs):
1. **README.md** claims: TikTok-like video platform with AI recommendations, video uploading, user authentication
2. **system-topology.md** claims: $1.9B revenue company with global operations, AI labs, blockchain mining, data centers, financial services

### Actual Implementation:
1. **Frontend** (`nova_blocks/frontend/`):
   - React 19 with react-router-dom v7 and react-scripts v3 (INCOMPATIBLE - react-scripts 3 only supports React up to v17)
   - Components: LionOfJudahJewelry, AlchemicalTransmutation, FaithWalkers, QuantumHealthyElementJewelry, Gaming, Arena - NO video components
   - Missing: Home.js (not imported in App.js), Upload.js, video player

2. **Backend** (`nova_blocks/backend/`):
   - Basic Express server with GPU inference endpoints
   - No video upload/storage endpoints
   - Has MongoDB connection but no video models
   - Tests reference non-existent routes (/api/pc/create)

3. **Finance** (`nova_blocks/finance/`):
   - Disconnected Python trading scripts
   - No API integration with web app

4. **Other Issues**:
   - Duplicate documentation
   - Broken test setup
   - Aspirational docs completely disconnected from reality

---

## Plan

### Phase 1: Choose Product Direction (CRITICAL)
**Recommendation:** Narrow to a **Gaming/Community Web Platform** based on what actually exists in code (Gaming, Arena features)

### Phase 2: Fix Engineering Foundations

1. **Fix React Dependencies** (Frontend):
   - Upgrade react-scripts to v5 (compatible with React 18+) OR downgrade React to v17
   - Update react-router-dom to v6 (compatible with react-scripts v3)

2. **Replace Broken Test Script**:
   - The current backend has tests but no proper test runner configured
   - Add Jest configuration for backend tests

3. **Add Basic CI**:
   - Add GitHub Actions for lint and test verification

### Phase 3: Reconcile Documentation with Implementation

1. **Rewrite README.md**:
   - Remove video platform claims
   - Document actual features (Gaming, Arena, Community)
   - Remove duplicate sections

2. **Update system-topology.md**:
   - Remove all aspirational revenue/ownership claims
   - Document actual architecture (simple Express + React)
   - Mark as " aspirational" if保留 at all

3. **Consolidate Docs**:
   - Remove or archive the elaborate multi-division topology
   - Create simple architecture diagram

### Phase 4: Reduce Complexity

1. **Clean up finance folder**:
   - Either integrate with main app or move to separate project
   - Document as "experimental" if kept

2. **Remove heavy dependencies**:
   - Remove pqcrypto if not used
   - Check GPU dependencies

### Phase 5: Improve Trust & Maintainability

1. **Add CHANGELOG.md**
2. **Add .gitignore** if missing
3. **Document what's actually working**
4. **Create realistic "Future Improvements"**

---

## Files to Edit

| File | Action |
|------|--------|
| README.md | Rewrite to reflect reality |
| nova_blocks/system-topology.md | Remove aspirational claims or mark clearly |
| nova_blocks/frontend/package.json | Fix dependencies |
| nova_blocks/backend/package.json | Add proper test runner |
| jest.config.js | Verify exists and works |
| TODO.md | Update with concrete tasks |

---

## Follow-up Steps

1. Confirm product direction with user
2. Run `npm install` in frontend to verify dependency issues
3. Run backend tests to verify broken state
4. Implement fixes incrementally
5. Test after each change

