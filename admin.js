import { supabase } from './supabaseClient.js'

// DOM Elements
const loginScreen = document.getElementById('login-screen')
const loginForm = document.getElementById('login-form')
const loginError = document.getElementById('login-error')
const adminContent = document.getElementById('admin-content')
const leadsBody = document.getElementById('admin-leads-body')
const searchInput = document.getElementById('search-leads')
const filterStatus = document.getElementById('filter-status')
const modal = document.getElementById('lead-modal')
const modalBackdrop = document.getElementById('modal-backdrop')
const closeModalBtn = document.getElementById('close-modal')
const logoutBtn = document.getElementById('logout-btn')

// Global state for leads
let allLeads = []

// --- AUTHENTICATION ---

async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session && !error) {
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (adminContent) adminContent.classList.add('hidden');
    if (window.lucide) window.lucide.createIcons();
}

function showDashboard() {
    console.log('Sessão ativa, exibindo dashboard...');
    if (loginScreen) loginScreen.classList.add('hidden');
    if (adminContent) {
        adminContent.style.display = 'block';
        adminContent.classList.remove('hidden');
    }
    
    // Load data initially
    loadSettings().catch(e => console.error('Failed to load settings:', e));
    loadLeads().catch(e => console.error('Failed to load leads:', e));
    
    // Subscribe to real-time changes
    subscribeToLeads();
    
    // Refresh icons
    if(window.lucide) {
        try {
            window.lucide.createIcons();
        } catch (e) { console.warn('Lucide icons failed to init', e); }
    }
}

// Handle Login Form
if (loginForm) {
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const submitBtn = document.getElementById('login-submit-btn');
        
        if (loginError) loginError.classList.add('hidden');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Verificando...';
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            
            if (error) throw error;
            
            showDashboard();
        } catch (error) {
            console.error('Erro no login:', error.message);
            if (loginError) {
                loginError.textContent = 'E-mail ou senha incorretos.';
                loginError.classList.remove('hidden');
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Entrar no Dashboard</span><i data-lucide="arrow-right" class="w-4 h-4"></i>';
                if (window.lucide) window.lucide.createIcons();
            }
        }
    };
}

// Logout logic
if (logoutBtn) {
    logoutBtn.onclick = async () => {
        await supabase.auth.signOut();
        location.reload();
    };
}

// Start by checking session
checkSession();

// --- REAL-TIME & DATA LOADING ---

function subscribeToLeads() {
    console.log('Iniciando escuta em tempo real para leads...');
    
    supabase
        .channel('public:leads')
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'leads' 
        }, (payload) => {
            console.log('Mudança detectada no banco de dados:', payload.eventType);
            loadLeads();
        })
        .subscribe();
}

async function loadSettings() {
    try {
        const { data, error } = await supabase.from('funnel_settings').select('*').eq('id', 'current').single()
        if (error) throw error;
        
        if (data) {
            const pos12 = document.getElementById('pos-12');
            const pos24 = document.getElementById('pos-24');
            if (pos12) pos12.value = data.next_position_12_months;
            if (pos24) pos24.value = data.next_position_24_months;
        }
    } catch (e) {
        console.error('Error loading settings:', e);
    }
}

window.updateSettings = async (type) => {
    const input = document.getElementById(`pos-${type}`);
    const newVal = parseInt(input.value)
    if(isNaN(newVal)) return alert('Por favor insira um número válido');

    const update = type === '12' 
        ? { next_position_12_months: newVal } 
        : { next_position_24_months: newVal }
    
    const { error } = await supabase.from('funnel_settings').update(update).eq('id', 'current')
    
    if (!error) {
        const btn = document.querySelector(`button[onclick="updateSettings('${type}')"]`);
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i>';
        if(window.lucide) window.lucide.createIcons();
        setTimeout(() => { 
            btn.innerHTML = originalHTML;
            if(window.lucide) window.lucide.createIcons();
        }, 2000);
    } else {
        alert('Erro ao salvar: ' + error.message)
    }
}

async function loadLeads() {
    try {
        console.log('Buscando leads no banco de dados...');
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error;

        allLeads = data || []
        updateStats(allLeads)
        renderLeadsTable(allLeads)
    } catch (error) {
        console.error('Error loading leads:', error)
        if (leadsBody) {
            leadsBody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-red-400">Erro ao carregar leads. Verifique as permissões do banco.</td></tr>`
        }
    }
}

function updateStats(leads) {
    const totalEl = document.getElementById('total-leads');
    const convEl = document.getElementById('conv-rate');
    const pendEl = document.getElementById('pending-leads');
    const lateEl = document.getElementById('late-leads');

    if(totalEl) totalEl.textContent = leads.length
    
    const converted = leads.filter(l => ['kyc_submitted', 'paid', 'approved'].includes(l.status)).length
    const rate = leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0
    if(convEl) convEl.textContent = `${rate}%`

    const pending = leads.filter(l => l.status === 'kyc_submitted' && l.payment_status !== 'paid').length
    if(pendEl) pendEl.textContent = pending

    const late = leads.filter(l => l.payment_status === 'late').length
    if(lateEl) lateEl.textContent = late
}

function renderLeadsTable(leads) {
    if (!leadsBody) return;
    
    if (leads.length === 0) {
        leadsBody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-500">Nenhum lead encontrado.</td></tr>`
        const info = document.getElementById('table-info');
        if(info) info.textContent = 'Mostrando 0 registros'
        return
    }

    leadsBody.innerHTML = leads.map(lead => {
        const name = lead.name || 'Visitante (Sem Nome)'
        const date = new Date(lead.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })
        
        let step = '1. Cadastro'
        let stepColor = 'text-slate-400'
        let progressWidth = '25%'
        
        if (lead.plan) { step = '2. Plano Escolhido'; stepColor = 'text-blue-400'; progressWidth = '50%'; }
        if (lead.status === 'kyc_submitted') { step = '3. KYC Enviado'; stepColor = 'text-amber-400'; progressWidth = '75%'; }
        if (lead.status === 'paid' || lead.payment_status === 'paid') { step = '4. Ativo / Pago'; stepColor = 'text-emerald-400'; progressWidth = '100%'; }

        let groupName = '-'
        let position = lead.assigned_position || 'N/A'
        if (lead.plan) {
            groupName = lead.plan.includes('12') ? 'Grupo 12M' : 'Grupo 24M'
        }

        let statusBadge = `<span class="px-2 py-1 rounded text-xs font-bold bg-slate-700 text-slate-400">Incompleto</span>`
        if (lead.status === 'kyc_submitted') statusBadge = `<span class="px-2 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-400">KYC Pendente</span>`
        if (lead.payment_status === 'paid') statusBadge = `<span class="px-2 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400">Pago</span>`
        if (lead.payment_status === 'late') statusBadge = `<span class="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400">Em Atraso</span>`

        return `
            <tr class="hover:bg-white/5 transition-colors border-b border-white/5">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                            ${name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="font-bold text-white text-sm">${name}</div>
                            <div class="text-xs text-slate-500">${date}</div>
                        </div>
                    </div>
                </td>
                <td class="p-4">
                    <div class="w-full bg-slate-800 rounded-full h-1.5 mb-2">
                        <div class="bg-teal-500 h-1.5 rounded-full" style="width: ${progressWidth}"></div>
                    </div>
                    <span class="text-xs font-medium ${stepColor}">${step}</span>
                </td>
                <td class="p-4">
                    <div class="text-sm text-slate-200">${groupName}</div>
                    <div class="text-xs text-teal-400 font-mono">Pos: ${position}</div>
                </td>
                <td class="p-4">
                    <div class="flex flex-col gap-1">
                        ${statusBadge}
                        <span class="text-[10px] text-slate-500">${lead.payment_method ? lead.payment_method.toUpperCase() : '-'}</span>
                    </div>
                </td>
                <td class="p-4 text-right">
                    <button class="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors" onclick="openLeadModal('${lead.id}')" title="Ver Detalhes">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                    <a href="https://wa.me/${lead.whatsapp?.replace(/\D/g,'')}" target="_blank" class="text-emerald-500 hover:text-emerald-400 p-2 hover:bg-emerald-500/10 rounded-lg transition-colors inline-block ml-1" title="WhatsApp">
                        <i data-lucide="message-circle" class="w-4 h-4"></i>
                    </a>
                </td>
            </tr>
        `
    }).join('')

    const info = document.getElementById('table-info');
    if(info) info.textContent = `Mostrando ${leads.length} registros`
    if(window.lucide) window.lucide.createIcons()
}

// --- SEARCH & FILTER ---

function filterLeads() {
    const term = searchInput ? searchInput.value.toLowerCase() : ""
    const status = filterStatus ? filterStatus.value : "all"

    const filtered = allLeads.filter(lead => {
        const matchesTerm = (lead.name || '').toLowerCase().includes(term) || 
                          (lead.email || '').toLowerCase().includes(term)
        
        let matchesStatus = true
        if (status === 'kyc_submitted') matchesStatus = lead.status === 'kyc_submitted'
        if (status === 'paid') matchesStatus = lead.payment_status === 'paid'
        if (status === 'late') matchesStatus = lead.payment_status === 'late'
        
        return matchesTerm && matchesStatus
    })

    renderLeadsTable(filtered)
}

if(searchInput) searchInput.addEventListener('input', filterLeads)
if(filterStatus) filterStatus.addEventListener('change', filterLeads)

// --- MODAL LOGIC ---

window.openLeadModal = (leadId) => {
    const lead = allLeads.find(l => l.id === leadId)
    if (!lead) return

    // Populate Basic Info
    document.getElementById('modal-name').textContent = lead.name || 'Sem Nome'
    document.getElementById('modal-email').textContent = lead.email || '-'
    document.getElementById('modal-phone').textContent = lead.whatsapp || '-'
    
    document.getElementById('modal-address').textContent = lead.address || 'Não informado'
    document.getElementById('modal-country').textContent = lead.country || 'Não informado'
    document.getElementById('modal-date').textContent = new Date(lead.created_at).toLocaleString()

    const docsList = document.getElementById('modal-docs-list')
    docsList.innerHTML = ''
    
    let docs = []
    try {
        if (typeof lead.kyc_documents === 'string') {
            docs = JSON.parse(lead.kyc_documents)
        } else if (Array.isArray(lead.kyc_documents)) {
            docs = lead.kyc_documents
        }
    } catch (e) { console.error('Error parsing docs', e) }

    if (docs && docs.length > 0) {
        docs.forEach(doc => {
            const fileName = doc.name || doc.path || 'Documento'
            let fileUrl = '#'
            if (doc.path) {
                try {
                    const { data } = supabase.storage.from('kyc-documents').getPublicUrl(doc.path)
                    fileUrl = data.publicUrl
                } catch (e) { console.error(e) }
            }

            docsList.innerHTML += `
                <div class="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <div class="bg-slate-800 p-2 rounded">
                            <i data-lucide="file-text" class="w-4 h-4 text-slate-400"></i>
                        </div>
                        <span class="text-xs text-slate-300 truncate">${fileName}</span>
                    </div>
                    <a href="${fileUrl}" target="_blank" class="text-blue-400 hover:text-blue-300 text-xs font-bold px-2 py-1 hover:bg-blue-500/10 rounded transition-colors">
                        Abrir
                    </a>
                </div>
            `
        })
    } else {
        docsList.innerHTML = '<p class="text-sm text-slate-500 italic">Nenhum documento encontrado.</p>'
    }

    document.getElementById('modal-plan').textContent = lead.plan || 'Não selecionado'
    document.getElementById('modal-group-pos').textContent = lead.assigned_position ? `Pos #${lead.assigned_position}` : '-'
    document.getElementById('modal-payment-method').textContent = lead.payment_method || '-'
    
    const payStatusEl = document.getElementById('modal-payment-status')
    payStatusEl.textContent = lead.payment_status || 'Pendente'
    payStatusEl.className = `inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${
        lead.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 
        lead.payment_status === 'late' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'
    }`

    if (lead.whatsapp) {
        const waBtn = document.getElementById('modal-wa-btn');
        if(waBtn) waBtn.href = `https://wa.me/${lead.whatsapp.replace(/\D/g,'')}`
    }

    if(modal) modal.classList.remove('hidden')
    if(window.lucide) window.lucide.createIcons()
}

const closeModal = () => {
    if(modal) modal.classList.add('hidden')
}

if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal)
if(modalBackdrop) modalBackdrop.addEventListener('click', closeModal)
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal() })