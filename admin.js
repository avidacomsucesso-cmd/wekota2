import { supabase } from './supabaseClient.js'

// DOM Elements
const loginScreen = document.getElementById('login-screen')
const adminContent = document.getElementById('admin-content')
const loginForm = document.getElementById('login-form')
const leadsBody = document.getElementById('admin-leads-body')
const searchInput = document.getElementById('search-leads')
const filterStatus = document.getElementById('filter-status')
const modal = document.getElementById('lead-modal')
const modalBackdrop = document.getElementById('modal-backdrop')
const closeModalBtn = document.getElementById('close-modal')

// Global state for leads
let allLeads = []

// --- AUTHENTICATION ---

const handleAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
        showDashboard()
        return
    }

    if (window.location.hash) {
        const { data, error } = await supabase.auth.getSession()
        if (data?.session) {
            window.history.replaceState(null, null, window.location.pathname)
            showDashboard()
        }
    }
}

handleAuth()

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value.trim()
    const password = document.getElementById('password').value.trim()
    
    console.log('Tentativa de login:', email);

    // Emergency Bypass
    if (email.toLowerCase() === 'admin@wekota.eu' && password === 'wekota2026admin') {
        console.log('Bypass detectado! Forçando entrada...');
        localStorage.setItem('admin_bypass', 'true');
        showDashboard();
        return;
    }

    try {
        console.log('Tentando login via Supabase...');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (!error) showDashboard()
        else alert('Erro no login: ' + error.message)
    } catch (err) {
        console.error('Erro crítico:', err);
        alert('Erro de conexão')
    }
})

document.getElementById('logout-btn').onclick = () => {
    supabase.auth.signOut()
    localStorage.removeItem('admin_bypass')
    location.reload()
}

if (localStorage.getItem('admin_bypass') === 'true') {
    showDashboard();
}

function showDashboard() {
    loginScreen.style.display = 'none';
    adminContent.classList.remove('hidden');
    adminContent.style.display = 'block';
    
    loadSettings();
    loadLeads();
    
    // Start Icon refresh in case they didn't load
    if(window.lucide) window.lucide.createIcons();
}

// --- FUNNEL SETTINGS ---

async function loadSettings() {
    const { data } = await supabase.from('funnel_settings').select('*').eq('id', 'current').single()
    if (data) {
        document.getElementById('pos-12').value = data.next_position_12_months
        document.getElementById('pos-24').value = data.next_position_24_months
    }
}

window.updateSettings = async (type) => {
    const newVal = parseInt(document.getElementById(`pos-${type}`).value)
    if(isNaN(newVal)) return alert('Por favor insira um número válido');

    const update = type === '12' 
        ? { next_position_12_months: newVal } 
        : { next_position_24_months: newVal }
    
    const { error } = await supabase.from('funnel_settings').update(update).eq('id', 'current')
    
    if (!error) {
        const btn = document.querySelector(`button[onclick="updateSettings('${type}')"]`);
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i>';
        if(window.lucide) window.lucide.createIcons();
        setTimeout(() => { 
            btn.innerHTML = originalText;
            if(window.lucide) window.lucide.createIcons();
        }, 2000);
    } else {
        alert('Erro ao salvar: ' + error.message)
    }
}

// --- LEADS MANAGEMENT ---

async function loadLeads() {
    // Select leads and join with installments if possible, otherwise just leads
    // Note: If installments table is empty or relation issues exist, this might return null for that field
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error loading leads:', error)
        leadsBody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-red-400">Erro ao carregar leads: ${error.message}</td></tr>`
        return
    }

    allLeads = data || []
    updateStats(allLeads)
    renderLeadsTable(allLeads)
}

function updateStats(leads) {
    document.getElementById('total-leads').textContent = leads.length
    
    // Calculate simple conversion rate (those who reached 'kyc_submitted' or 'paid' / total)
    const converted = leads.filter(l => ['kyc_submitted', 'paid', 'approved'].includes(l.status)).length
    const rate = leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0
    document.getElementById('conv-rate').textContent = `${rate}%`

    // Pending Payments (status = 'kyc_submitted' but not 'paid')
    // Or users who are at step 3/4 but haven't paid
    const pending = leads.filter(l => l.status === 'kyc_submitted').length
    document.getElementById('pending-leads').textContent = pending

    // Late payments (mock logic for now based on 'payment_status')
    const late = leads.filter(l => l.payment_status === 'late').length
    document.getElementById('late-leads').textContent = late
}

function renderLeadsTable(leads) {
    if (leads.length === 0) {
        leadsBody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-500">Nenhum lead encontrado.</td></tr>`
        document.getElementById('table-info').textContent = 'Mostrando 0 registros'
        return
    }

    leadsBody.innerHTML = leads.map(lead => {
        // Safe accessors
        const name = lead.name || 'Visitante (Sem Nome)'
        const email = lead.email || 'Email não informado'
        const date = new Date(lead.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })
        
        // Progress Logic
        let step = '1. Cadastro'
        let stepColor = 'text-slate-400'
        let progressWidth = '25%'
        
        if (lead.plan) { step = '2. Plano Escolhido'; stepColor = 'text-blue-400'; progressWidth = '50%'; }
        if (lead.status === 'kyc_submitted') { step = '3. KYC Enviado'; stepColor = 'text-amber-400'; progressWidth = '75%'; }
        if (lead.status === 'paid' || lead.payment_status === 'paid') { step = '4. Ativo / Pago'; stepColor = 'text-emerald-400'; progressWidth = '100%'; }

        // Group Logic
        let groupName = '-'
        let position = lead.assigned_position || 'N/A'
        if (lead.plan) {
            groupName = lead.plan.includes('12') ? 'Grupo 12M' : 'Grupo 24M'
        }

        // Status Badge Logic
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

    document.getElementById('table-info').textContent = `Mostrando ${leads.length} registros`
    if(window.lucide) window.lucide.createIcons()
}

// --- SEARCH & FILTER ---

function filterLeads() {
    const term = searchInput.value.toLowerCase()
    const status = filterStatus.value

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

searchInput.addEventListener('input', filterLeads)
filterStatus.addEventListener('change', filterLeads)

// --- MODAL LOGIC ---

window.openLeadModal = (leadId) => {
    const lead = allLeads.find(l => l.id === leadId)
    if (!lead) return

    // Populate Basic Info
    document.getElementById('modal-name').textContent = lead.name || 'Sem Nome'
    document.getElementById('modal-email').textContent = lead.email || '-'
    document.getElementById('modal-phone').textContent = lead.whatsapp || '-'
    document.getElementById('modal-avatar').textContent = (lead.name || '?').charAt(0).toUpperCase()
    
    document.getElementById('modal-address').textContent = lead.address || 'Não informado'
    document.getElementById('modal-country').textContent = lead.country || 'Não informado'
    document.getElementById('modal-date').textContent = new Date(lead.created_at).toLocaleString()

    // Documents
    const docsList = document.getElementById('modal-docs-list')
    docsList.innerHTML = ''
    
    // Parse documents if string, or use if array
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
            // If it's a supabase storage path, construct URL. 
            // Assuming simplified object { name: '...', path: '...' } or just strings
            const fileName = doc.name || doc.path || 'Documento'
            
            // Generate public URL if path exists
            let fileUrl = '#'
            if (doc.path) {
                const { data } = supabase.storage.from('kyc-documents').getPublicUrl(doc.path)
                fileUrl = data.publicUrl
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

    // Funnel Progress Visuals
    const progressMap = {
        'initial': 25,
        'plan_selected': 50,
        'kyc_submitted': 75,
        'approved': 85,
        'paid': 100
    }
    
    let currentStatus = 'initial'
    if (lead.plan) currentStatus = 'plan_selected'
    if (lead.status === 'kyc_submitted') currentStatus = 'kyc_submitted'
    if (lead.payment_status === 'paid') currentStatus = 'paid'

    const pct = progressMap[currentStatus] || 25
    document.getElementById('modal-progress-bar').style.width = `${pct}%`
    
    // Color dots based on progress
    const setDot = (id, active) => {
        const el = document.getElementById(id)
        if(active) {
            el.classList.remove('bg-slate-700', 'border-slate-600')
            el.classList.add('bg-teal-500', 'border-teal-400', 'text-slate-900')
        } else {
            el.classList.add('bg-slate-700', 'border-slate-600')
            el.classList.remove('bg-teal-500', 'border-teal-400', 'text-slate-900')
        }
    }
    
    setDot('step-1-dot', true) // Always active (registration)
    setDot('step-2-dot', pct >= 50)
    setDot('step-3-dot', pct >= 75)
    setDot('step-4-dot', pct >= 100)

    // Finance Data
    document.getElementById('modal-plan').textContent = lead.plan || 'Não selecionado'
    document.getElementById('modal-group-pos').textContent = lead.assigned_position ? `Pos #${lead.assigned_position}` : '-'
    document.getElementById('modal-payment-method').textContent = lead.payment_method || '-'
    
    const payStatusEl = document.getElementById('modal-payment-status')
    payStatusEl.textContent = lead.payment_status || 'Pendente'
    payStatusEl.className = `inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${
        lead.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 
        lead.payment_status === 'late' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'
    }`

    // Whatsapp Button
    if (lead.whatsapp) {
        document.getElementById('modal-wa-btn').href = `https://wa.me/${lead.whatsapp.replace(/\D/g,'')}`
    }

    // Show Modal
    modal.classList.remove('hidden')
    if(window.lucide) window.lucide.createIcons()
}

// Close Modal
const closeModal = () => {
    modal.classList.add('hidden')
}

closeModalBtn.addEventListener('click', closeModal)
modalBackdrop.addEventListener('click', closeModal)
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal() })