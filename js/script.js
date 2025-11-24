// ====================================
// CONFIGURATION
// ====================================
const API_URL = 'https://script.google.com/macros/s/AKfycbzUYHHvj0TH2ciz1HpVHR_OHJr1mQDOxtNPHDy9F2nyJHL0oDRhmZM0Q0oG0djE29KlVw/exec';
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTVgEYMm48zb1iuM1muKnkNWBrL048eleda0IEsJabHyXmgpHZKdml9sVdm1FpN_Gc3pHC-ZU79pvV2/pub?gid=0&single=true&output=csv';

let currentUser = null;
let currentView = 'home';
let currentModule = null;
let progressData = [];
let allUsers = [];
let isLoadingProgress = false;
let usersDatabase = [];

const moduleNames = {
  1: "Mata Pelajaran Koding dan KA",
  2: "Literasi Algoritma",
  3: "Etika dan Resiko KA",
  4: "Komunikasi Melalui Tools KA",
  5: "Pedagogik Koding dan KA"
};

// ====================================
// DATA LOADING FUNCTIONS
// ====================================

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }

  return data;
}

async function loadUsersFromSheet() {
  try {
    console.log('Loading users from sheet...');
    const response = await fetch(SHEET_CSV_URL, {
      mode: 'cors',
      headers: {
        'Accept': 'text/csv'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    console.log('CSV text received:', csvText.substring(0, 200) + '...');
    usersDatabase = parseCSV(csvText);
    console.log('Users loaded from sheet:', usersDatabase.length);
    console.log('Parsed users:', usersDatabase);

    // If no users loaded, try alternative approach
    if (usersDatabase.length === 0) {
      console.log('No users found, trying alternative parsing...');
      // Try parsing with different approach
      usersDatabase = parseCSVAlternative(csvText);
      console.log('Alternative parsing result:', usersDatabase);
    }
  } catch (error) {
    console.error('Error loading users from sheet:', error);
    // Fallback: try with no-cors mode
    try {
      console.log('Trying with no-cors mode...');
      const response = await fetch(SHEET_CSV_URL, { mode: 'no-cors' });
      // Note: with no-cors, we can't read the response
      console.log('No-cors request made, but cannot read response');
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
    usersDatabase = [];
  }
}

// Alternative CSV parsing function
function parseCSVAlternative(text) {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].trim() : '';
    });
    data.push(row);
  }

  return data;
}

function getUserFromSheet(username) {
  console.log('Looking for user:', username);
  console.log('Available users:', usersDatabase.map(u => ({ username: u.username, nama_lengkap: u.nama_lengkap })));

  // Try different possible column names for username
  const possibleUsernameFields = ['username', 'Username', 'user', 'User', 'nama', 'Nama'];

  const found = usersDatabase.find(user => {
    for (const field of possibleUsernameFields) {
      if (user[field] && user[field].toLowerCase() === username.toLowerCase()) {
        console.log('Found user with field:', field);
        return true;
      }
    }
    return false;
  });

  console.log('User found:', found);
  return found;
}

// ====================================
// LOGIN & AUTH FUNCTIONS
// ====================================

function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
      </svg>
    `;
  } else {
    input.type = 'password';
    icon.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
      </svg>
    `;
  }
}

function showRegisterForm() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('login-footer').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
  document.getElementById('register-footer').style.display = 'block';

  // Update header
  const title = document.querySelector('.text-3xl.font-bold.text-gray-800');
  title.textContent = 'Daftar Akun Baru';
  const subtitle = document.querySelector('.text-gray-600');
  subtitle.textContent = 'Buat akun untuk mulai belajar';
}

function showLoginForm() {
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('register-footer').style.display = 'none';
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('login-footer').style.display = 'block';

  // Update header
  const title = document.querySelector('.text-3xl.font-bold.text-gray-800');
  title.textContent = 'AI Coding Academy';
  const subtitle = document.querySelector('.text-gray-600');
  subtitle.textContent = 'Masuk ke akun Anda';

  // Clear register form
  document.getElementById('reg-username').value = '';
  document.getElementById('reg-email').value = '';
  document.getElementById('reg-password').value = '';
  document.getElementById('reg-fullname').value = '';
  document.getElementById('reg-school').value = '';
}

async function handleRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const fullname = document.getElementById('reg-fullname').value.trim();
  const school = document.getElementById('reg-school').value.trim();

  // Validasi
  if (!username || !email || !password || !fullname || !school) {
    showToast('Semua field harus diisi', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('Password minimal 6 karakter', 'error');
    return;
  }

  if (!email.includes('@')) {
    showToast('Email tidak valid', 'error');
    return;
  }

  showLoadingButton(true, 'register');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'register',
        username: username,
        email: email,
        password: password,
        nama_lengkap: fullname,
        peran: 'user',
        nama_sekolah: school
      })
    });

    // Simulasi registrasi berhasil
    setTimeout(() => {
      showLoadingButton(false, 'register');
      showToast('Registrasi berhasil! Silakan login dengan akun Anda', 'success');

      setTimeout(() => {
        showLoginForm();
        // Pre-fill username
        document.getElementById('username').value = username;
      }, 1500);
    }, 1500);

  } catch (error) {
    showLoadingButton(false, 'register');
    showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
    console.error('Register error:', error);
  }
}

async function handleLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  console.log('Login attempt for username:', username);

  if (!username || !password) {
    showToast('Username dan password harus diisi', 'error');
    return;
  }

  showLoadingButton(true, 'login');

  try {
    // Load users from sheet first
    await loadUsersFromSheet();

    // Check if user exists in sheet
    const userFromSheet = getUserFromSheet(username);

    setTimeout(() => {
      if (userFromSheet) {
        console.log('Login successful for user:', userFromSheet);
        // Use data from Google Sheet - handle different possible column names
        const userData = {
          username: userFromSheet.username || userFromSheet.Username || userFromSheet.user || userFromSheet.User || username,
          nama_lengkap: userFromSheet.nama_lengkap || userFromSheet.nama_lengkap || userFromSheet.Nama || userFromSheet.nama || userFromSheet.username || userFromSheet.Username || 'User',
          peran: userFromSheet.peran || userFromSheet.Peran || userFromSheet.role || userFromSheet.Role || 'user',
          email: userFromSheet.email || userFromSheet.Email || `${username}@academy.com`,
          nama_sekolah: userFromSheet.nama_sekolah || userFromSheet.Nama_sekolah || userFromSheet.sekolah || userFromSheet.Sekolah || 'Sekolah'
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));
        currentUser = userData;

        showLoadingButton(false, 'login');
        showToast('Login berhasil! Selamat datang ' + userData.nama_lengkap, 'success');

        setTimeout(() => {
          showMainApp();
        }, 1000);
      } else {
        console.log('Login failed - user not found');
        // User not found
        showLoadingButton(false, 'login');
        showToast('Username tidak ditemukan', 'error');
      }
    }, 1500);

  } catch (error) {
    showLoadingButton(false, 'login');
    showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
    console.error('Login error:', error);
  }
}

function handleLogout() {
  localStorage.removeItem('currentUser');
  currentUser = null;
  document.getElementById('main-app').style.display = 'none';
  document.getElementById('login-page').style.display = 'flex';
  showToast('Logout berhasil', 'success');
}

function showLoadingButton(loading, type = 'login') {
  const btn = document.getElementById(type === 'login' ? 'login-btn' : 'register-btn');
  const btnText = document.getElementById(type === 'login' ? 'login-btn-text' : 'register-btn-text');
  const spinner = document.getElementById(type === 'login' ? 'login-spinner' : 'register-spinner');

  if (loading) {
    btn.disabled = true;
    btn.classList.add('opacity-75', 'cursor-not-allowed');
    btnText.textContent = 'Memproses...';
    spinner.style.display = 'inline-block';
  } else {
    btn.disabled = false;
    btn.classList.remove('opacity-75', 'cursor-not-allowed');
    btnText.textContent = type === 'login' ? 'Masuk' : 'Daftar';
    spinner.style.display = 'none';
  }
}

function showMainApp() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('main-app').style.display = 'block';

  // Update user info in navbar
  document.getElementById('user-name').textContent = currentUser.nama_lengkap;
  document.getElementById('welcome-username').textContent = currentUser.nama_lengkap;
  const badge = document.getElementById('user-badge');
  badge.textContent = currentUser.peran === 'admin' ? '👑 Admin' : '👤 User';
  badge.className = currentUser.peran === 'admin'
    ? 'bg-yellow-500 px-3 py-1 rounded-full text-sm font-semibold'
    : 'bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold';

  // Show admin panel if admin
  if (currentUser.peran === 'admin') {
    document.getElementById('admin-panel').style.display = 'block';
    loadAdminData();
  }

  // Initialize data
  initDataSDK();
}

// Check if user is already logged in
function checkAuth() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showMainApp();
  }
}

// Enter key to login
document.addEventListener('DOMContentLoaded', () => {
  // Load users database on page load
  loadUsersFromSheet();
  checkAuth();

  document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  });
});

// ====================================
// ADMIN FUNCTIONS
// ====================================

async function loadAdminData() {
  try {
    const response = await fetch(API_URL + '?action=getAllUsers', {
      method: 'GET',
      mode: 'no-cors'
    });

    // Karena no-cors, kita tidak bisa membaca response
    // Dalam production, Apps Script akan mengembalikan data user
    // Untuk sementara gunakan array kosong
    allUsers = [];
    updateAdminStats();
    renderUsersTable();

  } catch (error) {
    console.error('Error loading admin data:', error);
    allUsers = [];
    updateAdminStats();
    renderUsersTable();
  }
}

function updateAdminStats() {
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter(u => u.is_active).length;
  const totalTeachers = allUsers.filter(u => u.peran === 'user').length;

  document.getElementById('total-users').textContent = totalUsers;
  document.getElementById('active-users').textContent = activeUsers;
  document.getElementById('total-teachers').textContent = totalTeachers;

  // Calculate average progress from actual data
  if (totalUsers > 0 && progressData.length > 0) {
    const userProgressMap = new Map();
    progressData.forEach(p => {
      if (!userProgressMap.has(p.username)) {
        userProgressMap.set(p.username, 0);
      }
      if (p.completed) {
        userProgressMap.set(p.username, userProgressMap.get(p.username) + 1);
      }
    });

    let totalProgress = 0;
    userProgressMap.forEach(count => {
      totalProgress += (count / 5) * 100;
    });

    const avgProgress = Math.round(totalProgress / totalUsers);
    document.getElementById('avg-progress').textContent = avgProgress + '%';
  } else {
    document.getElementById('avg-progress').textContent = '0%';
  }
}

function renderUsersTable() {
  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = '';

  if (allUsers.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="7" class="px-4 py-8 text-center text-gray-500">
        <div class="text-4xl mb-2">📭</div>
        <div>Belum ada data pengguna</div>
        <div class="text-sm mt-1">Data akan muncul setelah ada pengguna yang mendaftar</div>
      </td>
    `;
    tbody.appendChild(row);
    return;
  }

  allUsers.forEach(user => {
    const row = document.createElement('tr');
    row.className = 'border-b hover:bg-gray-50';

    const lastLogin = user.last_login ? new Date(user.last_login).toLocaleDateString('id-ID') : 'Belum pernah';

    row.innerHTML = `
      <td class="px-4 py-3 text-sm text-gray-800">${user.username}</td>
      <td class="px-4 py-3 text-sm text-gray-800">${user.nama_lengkap}</td>
      <td class="px-4 py-3 text-sm text-gray-600">${user.email}</td>
      <td class="px-4 py-3 text-sm text-gray-600">${user.nama_sekolah || '-'}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 text-xs rounded-full ${user.peran === 'admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}">
          ${user.peran === 'admin' ? '👑 Admin' : '👤 User'}
        </span>
      </td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 text-xs rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
          ${user.is_active ? '✓ Aktif' : '✗ Nonaktif'}
        </span>
      </td>
      <td class="px-4 py-3 text-sm text-gray-600">${lastLogin}</td>
    `;

    tbody.appendChild(row);
  });
}

// ====================================
// MODULE & PROGRESS FUNCTIONS
// ====================================

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show';
  if (type === 'error') {
    toast.classList.add('error');
  }
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

async function markModuleComplete(moduleNumber) {
  if (isLoadingProgress) return;
  if (!currentUser) return;

  const existing = progressData.find(p => p.module_number === moduleNumber && p.username === currentUser.username);
  if (existing && existing.completed) {
    showToast('✓ Modul ini sudah diselesaikan sebelumnya!');
    return;
  }

  isLoadingProgress = true;

  if (existing) {
    existing.completed = true;
    existing.completed_at = new Date().toISOString();
    const result = await window.dataSdk.update(existing);
    if (result.isOk) {
      showToast(`🎉 Selamat! Modul ${moduleNumber} berhasil diselesaikan!`);
    } else {
      showToast('❌ Gagal menyimpan progress. Coba lagi.', 'error');
    }
  } else {
    const newProgress = {
      module_number: moduleNumber,
      module_name: moduleNames[moduleNumber],
      completed: true,
      completed_at: new Date().toISOString(),
      username: currentUser.username
    };
    const result = await window.dataSdk.create(newProgress);
    if (result.isOk) {
      showToast(`🎉 Selamat! Modul ${moduleNumber} berhasil diselesaikan!`);
    } else {
      showToast('❌ Gagal menyimpan progress. Coba lagi.', 'error');
    }
  }

  isLoadingProgress = false;
}

function updateProgressUI() {
  if (!currentUser) return;

  const userProgress = progressData.filter(p => p.username === currentUser.username);
  const completedModules = userProgress.filter(p => p.completed);
  const completedCount = completedModules.length;
  const totalModules = 5;
  const percentage = Math.round((completedCount / totalModules) * 100);

  document.getElementById('total-progress').textContent = `${percentage}%`;
  document.getElementById('hero-progress').textContent = `${percentage}%`;
  document.getElementById('completed-count').textContent = completedCount;
  document.getElementById('progress-bar').style.width = `${percentage}%`;

  for (let i = 1; i <= 5; i++) {
    const moduleProgress = userProgress.find(p => p.module_number === i);
    const progressItem = document.getElementById(`progress-item-${i}`);
    const moduleCard = document.getElementById(`module-card-${i}`);

    if (progressItem) {
      const statusSpan = progressItem.querySelector('.text-sm');
      if (moduleProgress && moduleProgress.completed) {
        statusSpan.textContent = '✓ Selesai';
        statusSpan.className = 'text-sm text-green-600 font-semibold';
        progressItem.classList.add('bg-green-50');
        progressItem.classList.remove('bg-white');
      } else {
        statusSpan.textContent = 'Belum dimulai';
        statusSpan.className = 'text-sm text-gray-500';
        progressItem.classList.remove('bg-green-50');
        progressItem.classList.add('bg-white');
      }
    }

    if (moduleCard) {
      const existingBadge = moduleCard.querySelector('.completed-badge');
      if (moduleProgress && moduleProgress.completed) {
        if (!existingBadge) {
          const badge = document.createElement('div');
          badge.className = 'completed-badge';
          badge.textContent = '✓ Selesai';
          moduleCard.appendChild(badge);
        }
      } else {
        if (existingBadge) {
          existingBadge.remove();
        }
      }
    }
  }
}

const dataHandler = {
  onDataChanged(data) {
    progressData = data;
    updateProgressUI();
  }
};

async function initDataSDK() {
  if (window.dataSdk) {
    const result = await window.dataSdk.init(dataHandler);
    if (!result.isOk) {
      console.error("Failed to initialize Data SDK");
    }
  }
}

function showModulePage(moduleNumber) {
  currentView = 'module';
  currentModule = moduleNumber;
  renderView();
}

function showHomePage() {
  currentView = 'home';
  currentModule = null;
  renderView();
}

function showResourcesPage() {
  currentView = 'resources';
  renderView();
}

function renderView() {
  if (currentView === 'home') {
    document.getElementById('modules').style.display = 'block';
    document.getElementById('progress').style.display = 'block';
    if (currentUser && currentUser.peran === 'admin') {
      document.getElementById('admin-panel').style.display = 'block';
    }
    const moduleDetail = document.getElementById('module-detail');
    if (moduleDetail) {
      moduleDetail.style.display = 'none';
    }
  } else if (currentView === 'module') {
    document.getElementById('modules').style.display = 'none';
    document.getElementById('progress').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'none';

    let moduleDetail = document.getElementById('module-detail');
    if (!moduleDetail) {
      moduleDetail = document.createElement('section');
      moduleDetail.id = 'module-detail';
      moduleDetail.className = 'py-16 bg-gray-50';
      document.getElementById('progress').insertAdjacentElement('afterend', moduleDetail);
    }

    moduleDetail.style.display = 'block';

    moduleDetail.innerHTML = `
      <div class="container mx-auto px-6">
        <button onclick="showHomePage()" class="mb-6 flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-semibold transition">
          <span>←</span>
          <span>Kembali ke Daftar Modul</span>
        </button>

        <div class="bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto">
          <h2 class="text-3xl font-bold text-gray-800 mb-6">Modul ${currentModule}: ${moduleNames[currentModule]}</h2>
          <p class="text-gray-700 mb-8">Konten modul pembelajaran akan ditampilkan di sini...</p>

          <div class="mt-10 p-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white text-center">
            <h4 class="text-2xl font-bold mb-3">🎓 Selamat Belajar!</h4>
            <p class="text-lg mb-4">Anda telah menyelesaikan pembacaan Modul ${currentModule}</p>
            <button onclick="markModuleComplete(${currentModule}); showHomePage();" class="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition">
              Tandai Selesai & Kembali
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (currentView === 'resources') {
    document.getElementById('modules').style.display = 'none';
    document.getElementById('progress').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'none';

    let moduleDetail = document.getElementById('module-detail');
    if (!moduleDetail) {
      moduleDetail = document.createElement('section');
      moduleDetail.id = 'module-detail';
      moduleDetail.className = 'py-16 bg-gray-50';
      document.getElementById('progress').insertAdjacentElement('afterend', moduleDetail);
    }

    moduleDetail.style.display = 'block';

    moduleDetail.innerHTML = `
      <div class="container mx-auto px-6">
        <button onclick="showHomePage()" class="mb-6 flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-semibold transition">
          <span>←</span>
          <span>Kembali ke Beranda</span>
        </button>

        <div class="bg-white rounded-xl shadow-lg p-8 max-w-6xl mx-auto">
          <div class="text-center mb-10">
            <div class="text-6xl mb-4">📚</div>
            <h2 class="text-4xl font-bold text-gray-800 mb-3">Sumber Belajar untuk Guru</h2>
            <p class="text-gray-600 text-lg">Materi tambahan untuk memperkaya pembelajaran koding dan AI di kelas</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <!-- Contoh Kode Python -->
            <div class="border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition">
              <div class="flex items-center mb-4">
                <span class="text-3xl mr-3">🐍</span>
                <h3 class="text-xl font-bold text-gray-800">Contoh Kode Python</h3>
              </div>
              <p class="text-gray-600 mb-4">Template dan contoh program Python untuk mengajar dasar-dasar pemrograman</p>
              <div class="bg-gray-50 p-4 rounded-lg mb-3">
                <code class="text-sm text-gray-800">
                  # Halo Dunia<br>
                  print("Halo, Dunia!")<br>
                  <br>
                  # Variabel dan Tipe Data<br>
                  nama = "Guru"<br>
                  umur = 30
                </code>
              </div>
              <span class="text-xs text-blue-600 font-semibold">✓ Cocok untuk pemula</span>
            </div>

            <!-- Prompt ChatGPT -->
            <div class="border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition">
              <div class="flex items-center mb-4">
                <span class="text-3xl mr-3">💬</span>
                <h3 class="text-xl font-bold text-gray-800">Template Prompt ChatGPT</h3>
              </div>
              <p class="text-gray-600 mb-4">Contoh prompt efektif untuk menggunakan ChatGPT dalam pembelajaran</p>
              <div class="bg-gray-50 p-4 rounded-lg mb-3">
                <p class="text-sm text-gray-700 italic">
                  "Buatkan RPP untuk mengajar koding Python kepada siswa SMP dengan fokus pada pembuatan game sederhana"
                </p>
              </div>
              <span class="text-xs text-green-600 font-semibold">✓ Hemat waktu persiapan</span>
            </div>

            <!-- Proyek Kelas -->
            <div class="border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition">
              <div class="flex items-center mb-4">
                <span class="text-3xl mr-3">🎨</span>
                <h3 class="text-xl font-bold text-gray-800">Ide Proyek Kelas</h3>
              </div>
              <p class="text-gray-600 mb-4">Proyek menarik yang dapat dikerjakan siswa untuk praktik koding</p>
              <ul class="space-y-2 mb-3">
                <li class="text-sm text-gray-700">✓ Kalkulator Sederhana</li>
                <li class="text-sm text-gray-700">✓ Quiz Interaktif</li>
                <li class="text-sm text-gray-700">✓ Chatbot Sederhana</li>
                <li class="text-sm text-gray-700">✓ Game Tebak Angka</li>
              </ul>
              <span class="text-xs text-purple-600 font-semibold">✓ Step-by-step guide</span>
            </div>

            <!-- Tools AI -->
            <div class="border-2 border-orange-200 rounded-xl p-6 hover:shadow-lg transition">
              <div class="flex items-center mb-4">
                <span class="text-3xl mr-3">🤖</span>
                <h3 class="text-xl font-bold text-gray-800">Rekomendasi Tools AI</h3>
              </div>
              <p class="text-gray-600 mb-4">Tools AI terbaik untuk mendukung pembelajaran di kelas</p>
              <ul class="space-y-2 mb-3">
                <li class="text-sm text-gray-700">🔹 ChatGPT - Asisten pembelajaran</li>
                <li class="text-sm text-gray-700">🔹 GitHub Copilot - Bantuan koding</li>
                <li class="text-sm text-gray-700">🔹 Replit - Platform koding online</li>
                <li class="text-sm text-gray-700">🔹 Canva - Desain presentasi</li>
              </ul>
              <span class="text-xs text-orange-600 font-semibold">✓ Gratis untuk pendidikan</span>
            </div>

            <!-- Metode Pembelajaran -->
            <div class="border-2 border-red-200 rounded-xl p-6 hover:shadow-lg transition">
              <div class="flex items-center mb-4">
                <span class="text-3xl mr-3">👨‍🏫</span>
                <h3 class="text-xl font-bold text-gray-800">Metode Mengajar Efektif</h3>
              </div>
              <p class="text-gray-600 mb-4">Strategi dan tips mengajar koding yang terbukti efektif</p>
              <ul class="space-y-2 mb-3">
                <li class="text-sm text-gray-700">1️⃣ Mulai dengan visual (Scratch/Blockly)</li>
                <li class="text-sm text-gray-700">2️⃣ Gunakan analogi sehari-hari</li>
                <li class="text-sm text-gray-700">3️⃣ Project-based learning</li>
                <li class="text-sm text-gray-700">4️⃣ Pair programming</li>
              </ul>
              <span class="text-xs text-red-600 font-semibold">✓ Terbukti meningkatkan engagement</span>
            </div>

            <!-- Evaluasi & Assessment -->
            <div class="border-2 border-teal-200 rounded-xl p-6 hover:shadow-lg transition">
              <div class="flex items-center mb-4">
                <span class="text-3xl mr-3">📊</span>
                <h3 class="text-xl font-bold text-gray-800">Template Evaluasi</h3>
              </div>
              <p class="text-gray-600 mb-4">Rubrik dan format penilaian untuk proyek koding siswa</p>
              <ul class="space-y-2 mb-3">
                <li class="text-sm text-gray-700">📋 Rubrik penilaian proyek</li>
                <li class="text-sm text-gray-700">📋 Kuis koding online</li>
                <li class="text-sm text-gray-700">📋 Peer review template</li>
                <li class="text-sm text-gray-700">📋 Portfolio checklist</li>
              </ul>
              <span class="text-xs text-teal-600 font-semibold">✓ Siap pakai</span>
            </div>
          </div>

          <div class="mt-10 p-6 bg-gradient-to-r from-orange-500 to-pink-600 rounded-lg text-white text-center">
            <h4 class="text-2xl font-bold mb-3">💡 Butuh Bantuan Lebih?</h4>
            <p class="text-lg mb-4">Hubungi tim kami untuk mendapatkan materi customized sesuai kebutuhan kelas Anda</p>
            <button onclick="showToast('Fitur akan segera hadir!', 'success')" class="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition">
              Hubungi Kami
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

// Element SDK Configuration
const defaultConfig = {
  platform_title: "AI Coding Academy",
  hero_title: "Kuasai Koding & AI dengan Mudah",
  hero_subtitle: "Platform pembelajaran interaktif untuk menguasai keterampilan koding dan kecerdasan artificial",
  modules_heading: "Modul Pembelajaran",
  footer_text: "© 2025 Pelatihan Koding dan Kecerdasan Artificial oleh Suwito Setiadi",
  background_color: "#667eea",
  card_color: "#ffffff",
  text_color: "#1f2937",
  primary_action_color: "#3b82f6",
  secondary_action_color: "#8b5cf6",
  font_family: "ui-sans-serif, system-ui, sans-serif",
  font_size: 16
};

async function onConfigChange(config) {
  const platformTitle = config.platform_title || defaultConfig.platform_title;
  const heroTitle = config.hero_title || defaultConfig.hero_title;
  const heroSubtitle = config.hero_subtitle || defaultConfig.hero_subtitle;
  const modulesHeading = config.modules_heading || defaultConfig.modules_heading;
  const footerText = config.footer_text || defaultConfig.footer_text;

  const titleEl = document.getElementById('platform-title');
  if (titleEl) titleEl.textContent = platformTitle;

  const heroTitleEl = document.getElementById('hero-title');
  if (heroTitleEl) heroTitleEl.textContent = heroTitle;

  const heroSubEl = document.getElementById('hero-subtitle');
  if (heroSubEl) heroSubEl.textContent = heroSubtitle;

  const modulesEl = document.getElementById('modules-heading');
  if (modulesEl) modulesEl.textContent = modulesHeading;

  const footerEl = document.getElementById('footer-text');
  if (footerEl) footerEl.textContent = footerText;
}

if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange,
    mapToCapabilities: (config) => ({
      recolorables: [],
      borderables: [],
      fontEditable: undefined,
      fontSizeable: undefined
    }),
    mapToEditPanelValues: (config) => new Map([
      ["platform_title", config.platform_title || defaultConfig.platform_title],
      ["hero_title", config.hero_title || defaultConfig.hero_title],
      ["hero_subtitle", config.hero_subtitle || defaultConfig.hero_subtitle],
      ["modules_heading", config.modules_heading || defaultConfig.modules_heading],
      ["footer_text", config.footer_text || defaultConfig.footer_text]
    ])
  });
}