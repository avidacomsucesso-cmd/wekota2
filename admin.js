import { supabase } from './supabaseClient.js'

// --- DOM ELEMENTS ---
const loginContainer = document.getElementById('login-container')
const adminContent = document.getElementById('admin-content')

// Steps
const stepEmail = document.getElementById('step-email')
const stepOtp = document.getElementById('step-otp')
const stepMfa = document.getElementById('step-mfa')
const stepLoading = document.getElementById('step-loading')

// Inputs & Buttons
const emailInput = document.getElementById('email-input')
const otpInput = document.getElementById('otp-input')
const mfaInput = document.getElementById('mfa-input')
const btnSendOtp = document.getElementById('btn-send-otp')
const btnVerifyOtp = document.getElementById('btn-verify-otp')
const btnVerifyMfa = document.getElementById('btn-verify-mfa')

// MFA Setup
const mfaSetupDiv = document.getElementById('mfa-setup')
const mfaQrImg = document.getElementById('mfa-qr')
const mfaSetupText = document.getElementById('mfa-setup-text')

// Data
let currentFactorId = null;

// --- INITIALIZATION ---

// Check if already logged in with sufficient level
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        // Check Assurance Level (AAL)
        const { data: { level } } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        
        // Se já tiver AAL2 (MFA verificado) ou se só tivermos configurado OTP por enquanto
        if (level === 'aal2') {
            showDashboard();
        } else {
            // Se estiver logado (AAL1) mas falta MFA, verificar se tem fatores cadastrados
            const { data, error } = await supabase.auth.mfa.listFactors();
            if (data && data.totp.length > 0) {
                // Tem MFA configurado mas não validou nesta sessão -> Ir para passo MFA
                showStep('mfa');
                currentFactorId = data.totp[0].id;
            } else {
                // Não tem MFA configurado -> Iniciar setup
                startMfaEnrollment();
            }
        }
    } else {
        showStep('email');
    }
}

// Start
checkSession();

// --- STEP 1: SEND EMAIL OTP ---

btnSendOtp.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) return alert('Email inválido');

    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
            shouldCreateUser: false // Apenas usuários existentes (o admin deve ser criado previamente no Supabase)
        }
    });

    setLoading(false);

    if (error) {
        console.error(error);
        alert('Erro ao enviar código: ' + error.message);
    } else {
        showStep('otp');
    }
});

// --- STEP 2: VERIFY EMAIL OTP ---

btnVerifyOtp.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const token = otpInput.value.trim();
    if (token.length !== 6) return alert('Código deve ter 6 dígitos');

    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
    });

    setLoading(false);

    if (error) {
        alert('Código inválido ou expirado.');
    } else {
        // Login bem sucedido (AAL1). Agora verificar MFA.
        checkMfaStatus();
    }
});

async function checkMfaStatus() {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
        console.error(error);
        return alert('Erro ao verificar MFA');
    }

    const totpFactor = data.totp.find(f => f.status === 'verified');

    if (totpFactor) {
        // Já tem MFA verificado configurado -> Pedir desafio
        currentFactorId = totpFactor.id;
        showStep('mfa');
    } else {
        // Precisa configurar MFA -> Iniciar Enroll
        startMfaEnrollment();
    }
}

// --- STEP 3: MFA HANDLER ---

async function startMfaEnrollment() {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
    });
    setLoading(false);

    if (error) return alert('Erro ao iniciar configuração MFA: ' + error.message);

    currentFactorId = data.id;
    
    // Mostrar QR Code
    mfaSetupDiv.classList.remove('hidden');
    mfaSetupText.classList.remove('hidden');
    mfaQrImg.src = data.totp.qr_code; // Supabase retorna SVG data URI
    
    showStep('mfa');
}

btnVerifyMfa.addEventListener('click', async () => {
    const code = mfaInput.value.trim();
    if (code.length !== 6) return alert('Código inválido');

    setLoading(true);

    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: currentFactorId,
        code: code
    });

    setLoading(false);

    if (error) {
        alert('Código incorreto.');
    } else {
        showDashboard();
    }
});


// --- UTILS ---

function showStep(stepId) {
    [stepEmail, stepOtp, stepMfa, stepLoading].forEach(el => el.classList.add('hidden'));
    
    if (stepId === 'email') stepEmail.classList.remove('hidden');
    if (stepId === 'otp') stepOtp.classList.remove('hidden');
    if (stepId === 'mfa') stepMfa.classList.remove('hidden');
    if (stepId === 'loading') stepLoading.classList.remove('hidden');
}

function setLoading(isLoading) {
    if (isLoading) {
        showStep('loading');
    } else {
        // A lógica de retorno depende do contexto, simplificado aqui:
        // Se estava enviando OTP, vai para OTP. Se estava verificando, vai para MFA, etc.
        // O fluxo linear acima já chama showStep correto.
    }
}

// --- DASHBOARD LOGIC (Igual ao anterior, mas protegido) ---

function showDashboard() {
    loginContainer.classList.add('hidden'); // Esconde login
    adminContent.classList.remove('hidden'); // Mostra dashboard
    
    // Load data
    loadSettings();
    loadLeads();
    subscribeToLeads();
    
    if(window.lucide) window.lucide.createIcons();
}

// --- APP LOGIC ---
const leadsBody = document.getElementById('admin-leads-body')

// Logout
document.getElementById('logout-btn').onclick = async () => {
    await supabase.auth.signOut();
    location.reload();
}

// --- FUNNEL SETTINGS & LEADS (Mesma lógica de antes) ---

async function loadSettings() {
    try {
        const { data, error } = await supabase.from('funnel_settings').select('*').eq('id', 'current').single()
        if (data) {
            const pos12 = document.getElementById('pos-12');
            const pos24 = document.getElementById('pos-24');
            if (pos12) pos12.value = data.next_position_12_months;
            if (pos24) pos24.value = data.next_position_24_months;
        }
    } catch (e) { console.error(e); }
}

window.updateSettings = async (type) => {
    const input = document.getElementById(`pos-${type}`);
    const newVal = parseInt(input.value)
    
    const update = type === '12' 
        ? { next_position_12_months: newVal } 
        : { next_position_24_months: newVal }
    
    const { error } = await supabase.from('funnel_settings').update(update).eq('id', 'current')
    if (!error) alert('Salvo!');
}

async function loadLeads() {
    try {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) {
            updateStats(data);
            renderLeadsTable(data);
        }
    } catch (e) { console.error(e); }
}

function subscribeToLeads() {
    supabase
        .channel('public:leads')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, loadLeads)
        .subscribe();
}

function updateStats(leads) {
    const totalEl = document.getElementById('total-leads');
    if(totalEl) totalEl.textContent = leads.length;
    // ... resto da lógica de stats
}

function renderLeadsTable(leads) {
    if (!leadsBody) return;
    leadsBody.innerHTML = leads.map(lead => `
        <tr class="hover:bg-white/5 transition-colors border-b border-white/5">
            <td class="p-4 text-white font-bold">${lead.name || 'Sem nome'}</td>
            <td class="p-4 text-slate-300 text-xs">${lead.status || '-'}</td>
            <td class="p-4 text-teal-400 font-mono">#${lead.assigned_position || '-'}</td>
            <td class="p-4 text-slate-400 text-xs">${lead.payment_method || '-'}</td>
            <td class="p-4 text-right">
                <button class="text-slate-400 hover:text-white" onclick="openLeadModal('${lead.id}')">👁️</button>
            </td>
        </tr>
    `).join('');
    if(window.lucide) window.lucide.createIcons();
}

// Modal Logic (simplificado para caber)
window.openLeadModal = (id) => {
    const modal = document.getElementById('lead-modal');
    if(modal) modal.classList.remove('hidden');
    // Preencher dados...
}
document.getElementById('close-modal')?.addEventListener('click', () => {
    document.getElementById('lead-modal')?.classList.add('hidden');
});