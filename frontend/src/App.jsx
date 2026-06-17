import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Base Input States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('Normal User');

  // Dynamic Auto-Store Input States
  const [autoStoreName, setAutoStoreName] = useState('');
  const [autoStoreAddress, setAutoStoreAddress] = useState('');

  // Security Configuration states
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordBox, setShowPasswordBox] = useState(false);

  // Normal User Dashboard lists State Data
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Business / Management States Data Container arrays
  const [ownerData, setOwnerData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  
  // Admin Action Form Builders
  const [adminStoreName, setAdminStoreName] = useState('');
  const [adminStoreAddress, setAdminStoreAddress] = useState('');
  const [adminStoreOwnerEmail, setAdminStoreOwnerEmail] = useState('');

  const AUTH_URL = 'http://localhost:5000/api/auth';
  const STORE_URL = 'http://localhost:5000/api/stores';

  // Strict Form Validation Framework Verification Checker
  const passesFormValidations = () => {
    if (name.length < 20 || name.length > 60) {
      setMessage({ text: 'Validation Failure: Name field must measure between 20 and 60 characters long.', type: 'error' });
      return false;
    }
    if (address.length > 400) {
      setMessage({ text: 'Validation Failure: Address string length cannot cross 400 characters limit boundary.', type: 'error' });
      return false;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
    if (!passwordRegex.test(password)) {
      setMessage({ text: 'Validation Failure: Password requirements unmet (8-16 length, 1 uppercase, 1 special symbol).', type: 'error' });
      return false;
    }
    return true;
  };

  const synchronizeEnvironment = async () => {
    if (!user || !user.id || !user.role) return;
    
    try {
      if (user.role === 'Normal User') {
        const res = await axios.get(`${STORE_URL}?user_id=${user.id}`);
        setStores(res.data);
      } else if (user.role === 'Store Owner') {
        const res = await axios.get(`${STORE_URL}/owner-dashboard?owner_id=${user.id}`);
        setOwnerData(res.data);
      } else if (user.role === 'System Administrator') {
        const res = await axios.get(`${STORE_URL}/admin-dashboard`);
        setAdminData(res.data);
      }
    } catch (err) {
      console.error("Dashboard dataset stream sync block fault disruption.");
    }
  };

  useEffect(() => { synchronizeEnvironment(); }, [user]);

  const resetInputFields = () => {
    setName(''); setEmail(''); setPassword(''); setAddress(''); setRole('Normal User');
    setAutoStoreName(''); setAutoStoreAddress('');
  };

  const handleLoginSubmit = async () => {
    setMessage({ text: '', type: '' });
    try {
      const res = await axios.post(`${AUTH_URL}/login`, { email, password });
      setUser(res.data.user);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Invalid match parameters.', type: 'error' });
    }
  };

  const handleSignupSubmit = async () => {
    setMessage({ text: '', type: '' });
    
    console.log("🔥 FRONTEND REGISTER BUTTON CLICKED. CURRENT STATE VARIABLES:");
    console.log({ name, email, password, address, role, autoStoreName, autoStoreAddress });

    if (!passesFormValidations()) return;

    try {
      console.log("📡 Sending Axios POST request to backend...");
      const res = await axios.post(`${AUTH_URL}/register`, { 
        name, email, password, address, role,
        storeName: autoStoreName, storeAddress: autoStoreAddress 
      });
      console.log("📥 Backend responded with success:", res.data);
      resetInputFields();
      setMessage({ text: 'Account processed perfectly! Flip gateway module view to proceed.', type: 'success' });
      setIsLogin(true);
    } catch (err) {
      console.error("❌ Axios request crashed:", err);
      setMessage({ text: err.response?.data?.error || 'Database submission rejected registration configuration.', type: 'error' });
    }
  };

  const handleAdminAddUser = async () => {
    if (!passesFormValidations()) return;
    try {
      await axios.post(`${AUTH_URL}/register`, { 
        name, email, password, address, role,
        storeName: autoStoreName, storeAddress: autoStoreAddress
      });
      alert("System Admin Action: Account and linked components logged successfully!");
      resetInputFields();
      synchronizeEnvironment();
    } catch (err) {
      alert(err.response?.data?.error || "Error adding record registry node.");
    }
  };

  const handleAdminAddStore = async () => {
    try {
      await axios.post(`${STORE_URL}/admin-add-store`, { name: adminStoreName, address: adminStoreAddress, owner_email: adminStoreOwnerEmail });
      alert("System Admin Action: Connected store object entity created successfully!");
      setAdminStoreName(''); setAdminStoreAddress(''); setAdminStoreOwnerEmail('');
      synchronizeEnvironment();
    } catch (err) {
      alert(err.response?.data?.error || "Error creating location tracking row context.");
    }
  };

  const handlePasswordOverride = async () => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
    if (!passwordRegex.test(newPassword)) {
      alert("Constraint matching failure: Password rule requirements missing.");
      return;
    }
    try {
      await axios.post(`${AUTH_URL}/update-password`, { user_id: user.id, newPassword });
      alert("Password string adjustments mapped completely.");
      setNewPassword(''); setShowPasswordBox(false);
    } catch (err) {
      alert("Adjustment request processing breakdown error.");
    }
  };

  const fireReviewRatingPacket = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${STORE_URL}/rate`, { user_id: user.id, store_id: selectedStore.id, rating, review_text: reviewText });
      alert("Rating record updated successfully!");
      setSelectedStore(null); setReviewText('');
      synchronizeEnvironment();
    } catch (err) {
      alert("Error logging metadata score data arrays.");
    }
  };

  // Modular Multi-Role Cross-Cut Universal Search String Filters
  const filteredNormalStores = stores.filter(s => {
    const sLower = search.toLowerCase().trim();
    return !search || (s.name && s.name.toLowerCase().includes(sLower)) || (s.address && s.address.toLowerCase().includes(sLower));
  });

  const filteredAdminStores = adminData?.stores.filter(s => {
    const sLower = search.toLowerCase().trim();
    return !search || s.name.toLowerCase().includes(sLower) || s.address.toLowerCase().includes(sLower) || s.owner_email.toLowerCase().includes(sLower);
  }) || [];

  const filteredAdminUsers = adminData?.users.filter(u => {
    const sLower = search.toLowerCase().trim();
    return !search || u.name.toLowerCase().includes(sLower) || u.email.toLowerCase().includes(sLower) || u.address.toLowerCase().includes(sLower) || u.role.toLowerCase().includes(sLower);
  }) || [];

  if (!user) {
    return (
      <div style={styles.body}>
        <div style={styles.container}>
          {isLogin ? (
            <div>
              <h2 style={styles.heading}>Sign In Gateway</h2>
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
              <input type="password" placeholder="Password Structure" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
              <button onClick={handleLoginSubmit} style={styles.button}>Authenticate Profile</button>
              <div onClick={() => { setIsLogin(false); resetInputFields(); setMessage({ text: '', type: '' }); }} style={styles.link}>Request Membership Registration Portal</div>
            </div>
          ) : (
            <div>
              <h2 style={styles.heading}>Platform Registration</h2>
              <input type="text" placeholder="Full Name (Min 20, Max 60 Chars)" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
              <input type="email" placeholder="Email Contact Address" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
              <input type="password" placeholder="Password (8-16 L, 1 Cap, 1 Spec)" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
              <input type="text" placeholder="Physical Home Address Block (Max 400 Chars)" value={address} onChange={(e) => setAddress(e.target.value)} style={styles.input} />
              
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Select Assignment Identity Role:</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
                <option value="Normal User">Normal User (Rater)</option>
                <option value="Store Owner">Store Owner (Merchant Vendor)</option>
                <option value="System Administrator">System Administrator (Platform Manager)</option>
              </select>

              {/* DYNAMIC AUTO-STORE FIELDS FOR PUBLIC REGISTRATION SCREEN */}
              {role === 'Store Owner' && (
                <div style={{ background: '#eef2f7', padding: '12px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #ced4da' }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#007bff', fontSize: '13px' }}>🏢 Link Your Business Location Context</h5>
                  <input type="text" placeholder="Your Store Business Name" value={autoStoreName} onChange={(e) => setAutoStoreName(e.target.value)} style={styles.input} />
                  <input type="text" placeholder="Store Complete Physical Address" value={autoStoreAddress} onChange={(e) => setAutoStoreAddress(e.target.value)} style={styles.input} />
                </div>
              )}

              <button onClick={handleSignupSubmit} style={styles.button}>Execute Structural Registry</button>
              <div onClick={() => { setIsLogin(true); resetInputFields(); setMessage({ text: '', type: '' }); }} style={styles.link}>Existing verified relations? Return to login screen</div>
            </div>
          )}
          {message.text && <div style={{ ...styles.message, color: message.type === 'success' ? 'green' : 'red' }}>{message.text}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ddd', paddingBottom: '15px' }}>
        <div>
          <h2>Session Handler Instance: {user.name} <span style={{ color: '#007bff', fontSize: '15px' }}>[{user.role}]</span></h2>
          <button onClick={() => setShowPasswordBox(!showPasswordBox)} style={{ fontSize: '11px', padding: '4px' }}>{showPasswordBox ? 'Decline Revision' : '🛠️ Force Modify Password String'}</button>
          {showPasswordBox && (
            <div style={{ marginTop: '5px', display: 'flex', gap: '5px' }}>
              <input type="password" placeholder="Enforce matching constraint payload" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ padding: '5px' }} />
              <button onClick={handlePasswordOverride} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Apply Update</button>
            </div>
          )}
        </div>
        <button onClick={() => { setUser(null); setOwnerData(null); setAdminData(null); setStores([]); }} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Terminate Session (Logout)</button>
      </header>

      {/* RENDER LOGIC INTERFACE SPECIFIC TO SYSTEM ADMINISTRATOR ROLE */}
      {user.role === 'System Administrator' && adminData && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
            <div style={styles.metricBox}><h4>Total Users Logged</h4><h2>{adminData.metrics.totalUsers}</h2></div>
            <div style={styles.metricBox}><h4>Total Venues Configured</h4><h2>{adminData.metrics.totalStores}</h2></div>
            <div style={styles.metricBox}><h4>Total Feedback Submissions</h4><h2>{adminData.metrics.totalRatings}</h2></div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
            <div style={{ ...styles.card, flex: 1, minWidth: '300px' }}>
              <h3>🔧 Admin Utility Panel: Inject New Account Rows</h3>
              <input type="text" placeholder="Full Name (Min 20, Max 60)" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
              <input type="email" placeholder="Unique Identity Email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
              <input type="password" placeholder="Constraint Password String" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
              <input type="text" placeholder="Physical Street Home Address" value={address} onChange={(e) => setAddress(e.target.value)} style={styles.input} />
              <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
                <option value="Normal User">Normal User</option>
                <option value="System Administrator">System Administrator</option>
                <option value="Store Owner">Store Owner</option>
              </select>

              {/* DYNAMIC AUTO-STORE FIELDS FOR ADMIN USER CREATION PANEL */}
              {role === 'Store Owner' && (
                <div style={{ background: '#eef2f7', padding: '12px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #ced4da' }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#007bff', fontSize: '13px' }}>🏢 Link Business Location Automatically</h5>
                  <input type="text" placeholder="Store Business Name" value={autoStoreName} onChange={(e) => setAutoStoreName(e.target.value)} style={styles.input} />
                  <input type="text" placeholder="Store Location Address" value={autoStoreAddress} onChange={(e) => setAutoStoreAddress(e.target.value)} style={styles.input} />
                </div>
              )}

              <button onClick={handleAdminAddUser} style={styles.button}>Inject User Into Database</button>
            </div>

            <div style={{ ...styles.card, flex: 1, minWidth: '300px' }}>
              <h3>🏢 Admin Utility Panel: Configure Connected Store Venue Manually</h3>
              <input type="text" placeholder="Registered Location Store Name" value={adminStoreName} onChange={(e) => setAdminStoreName(e.target.value)} style={styles.input} />
              <input type="text" placeholder="Complete Street Physical Address" value={adminStoreAddress} onChange={(e) => setAdminStoreAddress(e.target.value)} style={styles.input} />
              <input type="email" placeholder="Associated Store Owner User Email Row Link" value={adminStoreOwnerEmail} onChange={(e) => setAdminStoreOwnerEmail(e.target.value)} style={styles.input} />
              <button onClick={handleAdminAddStore} style={{ ...styles.button, backgroundColor: '#28a745' }}>Inject Store Mapping Entry</button>
            </div>
          </div>

          <input type="text" placeholder="🔍 Administrative Global Matrix Search (Matches Name, Email, Address, Role fields)..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...styles.input, padding: '12px', fontSize: '15px' }} />

          <h3>System Architecture Configuration Listings: Stores Matrix</h3>
          <table style={styles.table}>
            <thead><tr style={{ background: '#eee' }}><th style={styles.th}>Store Name</th><th style={styles.th}>Store Location Address</th><th style={styles.th}>Aggregate Metric Grade Score</th><th style={styles.th}>Owner Email Context</th></tr></thead>
            <tbody>{filteredAdminStores.map((s, i) => <tr key={i}><td style={styles.td}>{s.name}</td><td style={styles.td}>{s.address}</td><td style={styles.td}>{Number(s.overall_rating).toFixed(1)} ★</td><td style={styles.td}>{s.owner_email || 'Unassigned Row'}</td></tr>)}</tbody>
          </table>

          <h3>System Architecture Configuration Listings: Users Matrix</h3>
          <table style={styles.table}>
            <thead><tr style={{ background: '#eee' }}><th style={styles.th}>User Name</th><th style={styles.th}>Email String Node</th><th style={styles.th}>Address Column Context</th><th style={styles.th}>Structural Assignment Role</th><th style={styles.th}>Store Owner Associated Running Avg</th></tr></thead>
            <tbody>{filteredAdminUsers.map((u, i) => <tr key={i}><td style={styles.td}>{u.name}</td><td style={styles.td}>{u.email}</td><td style={styles.td}>{u.address}</td><td style={styles.td}>{u.role}</td><td style={{ ...styles.td, color: '#ff9800', fontWeight: 'bold' }}>{u.role === 'Store Owner' ? `${Number(u.owner_avg_rating).toFixed(1)} ★` : 'N/A (Non-Owner Profile Row)'}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {/* RENDER LOGIC INTERFACE SPECIFIC TO NORMAL USER ROLE */}
      {user.role === 'Normal User' && (
        <div style={{ marginTop: '20px' }}>
          <input type="text" placeholder="🔍 Instant search filter lookup by Store Name or Street Address..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', maxWidth: '450px', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', marginBottom: '20px' }} />
          <h3>Available Stores Listings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
            {filteredNormalStores.map(store => (
              <div key={store.id} style={styles.card}>
                <h4>{store.name}</h4>
                <p style={{ color: '#666', fontSize: '14px' }}>📍 {store.address}</p>
                <p style={{ fontWeight: 'bold', color: '#ff9800' }}>⭐ Overall Rating: {Number(store.overall_rating || 0).toFixed(1)} / 5.0</p>
                <p style={{ fontSize: '13px', padding: '4px', background: '#f1f3f5', borderRadius: '4px', fontWeight: 'bold' }}>👤 Your Submitted Score: {store.user_submitted_rating ? `${store.user_submitted_rating} ★` : 'No scoring transaction history discovered'}</p>
                <button onClick={() => { setSelectedStore(store); setRating(store.user_submitted_rating || 5); setReviewText(store.user_review_text || ''); }} style={{ ...styles.button, backgroundColor: store.user_submitted_rating ? '#ff9800' : '#28a745' }}>{store.user_submitted_rating ? '✍️ Modify Your Submitted Rating' : '⭐ Submit A Rating Option'}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER LOGIC INTERFACE SPECIFIC TO STORE OWNER ROLE */}
      {user.role === 'Store Owner' && ownerData && (
        <div style={{ marginTop: '20px' }}>
          {!ownerData.hasStore ? (
            <div style={{ background: '#fff3cd', padding: '15px', color: '#856404', borderRadius: '4px' }}>No active mapped store properties identified linking to your metadata user row sequence ID index. Contact system administrative tier management.</div>
          ) : (
            <div>
              <div style={styles.card}>
                <h3 style={{ color: '#007bff', margin: 0 }}>🏢 Connected Property Venue: {ownerData.store.name}</h3>
                <p style={{ color: '#555' }}>📍 Location Footprint Address: {ownerData.store.address}</p>
                <h2 style={{ color: '#ff9800', margin: '10px 0 0 0' }}>📊 Real-Time Computed Store Average: {ownerData.averageRating} / 5.0</h2>
              </div>
              <h3>Customer Raters Metric Feedback Logs Matrix</h3>
              <table style={styles.table}>
                <thead><tr style={{ background: '#eee' }}><th style={styles.th}>Customer Reviewer Identity Name</th><th style={styles.th}>User Account Address</th><th style={styles.th}>Assigned Stars Value</th><th style={styles.th}>Commentary Text Context</th></tr></thead>
                <tbody>{ownerData.reviewersList.map((r, i) => <tr key={i}><td style={styles.td}>{r.user_name}</td><td style={styles.td}>{r.user_address}</td><td style={{ ...styles.td, color: '#ff9800', fontWeight: 'bold' }}>{r.rating_value} ★</td><td style={styles.td}>"{r.review_text || 'No description left.'}"</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* USER INTERACTION POPUP RATING MODAL COMPONENT WINDOW */}
      {selectedStore && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <h3>{selectedStore.user_submitted_rating ? 'Modify Existing Rating Metric' : 'Log New Evaluation Record'} - {selectedStore.name}</h3>
            <form onSubmit={fireReviewRatingPacket}>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Assign Scale Metric (1-5 Stars range limit value):</label>
              <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))} style={styles.input}>
                <option value="5">⭐⭐⭐⭐⭐ (5)</option><option value="4">⭐⭐⭐⭐ (4)</option><option value="3">⭐⭐⭐ (3)</option><option value="2">⭐⭐ (2)</option><option value="1">⭐ (1)</option>
              </select>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Review Feedback Details Context:</label>
              <textarea placeholder="Provide experience logs context info..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} style={{ ...styles.input, height: '80px', resize: 'none' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ ...styles.button, margin: 0 }}>Save Changes</button>
                <button type="button" onClick={() => setSelectedStore(null)} style={{ ...styles.button, backgroundColor: '#6c757d', margin: 0 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  body: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f9', fontFamily: 'Arial' },
  container: { background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', boxSizing: 'border-box' },
  heading: { textAlign: 'center', color: '#333', marginBottom: '20px' },
  input: { width: '100%', padding: '10px', margin: '8px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '15px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: '15px', fontSize: '13px', color: '#007bff', cursor: 'pointer' },
  message: { textAlign: 'center', marginTop: '10px', fontWeight: 'bold', fontSize: '13px' },
  metricBox: { background: 'white', padding: '20px', borderRadius: '6px', border: '1px solid #ddd', flex: 1, textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  card: { background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', marginBottom: '30px', background: 'white', border: '1px solid #ddd' },
  th: { padding: '10px', border: '1px solid #ddd', textAlign: 'left' },
  td: { padding: '10px', border: '1px solid #ddd' },
  modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modal: { background: 'white', padding: '25px', borderRadius: '8px', width: '90%', maxWidth: '420px' }
};

export default App;