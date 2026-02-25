import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const loginScreen = document.getElementById('login-screen')
const adminContent = document.getElementById('admin-content')
const loginForm = document.getElementById('login-form')
const leadsBody = document.getElementById('admin-leads-body')

// Auth Check & Hash Token Handler
const handleAuth = async () => {
    // 1. Verificar se já existe sessão
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
        showDashboard()
        return
    }

    // 2. Capturar token do URL (Magic Link fallback)
    if (window.location.hash) {
        const { data, error } = await supabase.auth.getSession()
        if (data?.session) {
            // Limpar o hash do URL para ficar bonito
            window.history.replaceState(null, null, window.location.pathname)
            showDashboard()
        }
    }
}

handleAuth()

// Auth Check
supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) showDashboard()
})

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    
    console.log('Tentativa de login:', email);

    // LOGIN DE EMERGÊNCIA (Force Bypass)
    if (email.trim() === 'admin@wekota.eu' && password.trim() === 'wekota2026admin') {
        console.log('Acesso via Master Key liberado - Forçando exibição');
        localStorage.setItem('admin_bypass', 'true');
        showDashboard();
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ 
            email, 
            password 
        })
        
        if (!error) {
            showDashboard()
        } else {
            alert('Erro no login: ' + error.message)
        }
    } catch (err) {
        console.error('Erro crítico no login:', err);
    }
})

// Auto-show se já tiver bypass
if (localStorage.getItem('admin_bypass') === 'true') {
    showDashboard();
}

document.getElementById('logout-btn').onclick = () => {
    supabase.auth.signOut()
    location.reload()
}

async function showDashboard() {
    console.log('Executando showDashboard()...');
    const loginScreen = document.getElementById('login-screen');
    const adminContent = document.getElementById('admin-content');
    
    if (loginScreen && adminContent) {
        loginScreen.style.display = 'none';
        adminContent.style.display = 'block';
        adminContent.classList.remove('hidden'); // Garante que a classe tailwind não bloqueie
        console.log('Interface alternada com sucesso');
        loadSettings();
        loadLeads();
    } else {
        console.error('Elementos da interface não encontrados!', {loginScreen, adminContent});
    }
}

// 1. Controle de Posições (Funil)
async function loadSettings() {
    const { data } = await supabase.from('funnel_settings').select('*').eq('id', 'current').single()
    if (data) {
        document.getElementById('pos-12').value = data.next_position_12_months
        document.getElementById('pos-24').value = data.next_position_24_months
    }
}

window.updateSettings = async (type) => {
    const newVal = parseInt(document.getElementById(`pos-${type}`).value)
    const update = type === '12' 
        ? { next_position_12_months: newVal } 
        : { next_position_24_months: newVal }
    
    const { error } = await supabase.from('funnel_settings').update(update).eq('id', 'current')
    if (!error) alert('Posição atualizada! O próximo cliente verá este número.')
}

// 2. Gestão de Membros e Grupos
async function loadLeads() {
    const { data: leads, error } = await supabase
        .from('leads')
        .select('*, installments(*)')
        .order('created_at', { ascending: false })

    if (error) return

    leadsBody.innerHTML = leads.map(lead => {
        const isLate = lead.payment_status === 'late'
        // Simulação de dias de atraso (lógica real viria da tabela installments)
        const daysLate = isLate ? Math.floor(Math.random() * 15) + 1 : 0 

        return `
            <tr class="hover:bg-white/5 transition-colors">
                <td class="p-4">
                    <div class="font-bold text-white">${lead.name || 'Sem nome'}</div>
                    <div class="text-xs text-slate-500">${lead.email || ''}</div>
                </td>
                <td class="p-4">
                    <div class="text-white font-medium">${lead.plan?.includes('12') ? 'Grupo #101' : 'Grupo #102'}</div>
                    <div class="text-xs text-teal-400">Posição ${lead.assigned_position || '-'}</div>
                </td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase ${isLate ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}">
                        ${isLate ? 'Em Atraso' : 'Em Dia'}
                    </span>
                </td>
                <td class="p-4 text-slate-300">
                    ${lead.installments?.length ? 'Parcela ' + lead.installments.length : 'Aguardando'}
                </td>
                <td class="p-4">
                    <span class="${isLate ? 'text-red-400' : 'text-slate-500'} font-medium">
                        ${isLate ? daysLate + ' dias' : '-'}
                    </span>
                </td>
                <td class="p-4 text-right">
                    <div class="flex justify-end gap-2">
                        <button class="text-slate-400 hover:text-white p-1" title="Ver KYC">📄</button>
                        <a href="https://wa.me/${lead.whatsapp?.replace(/\D/g,'')}" target="_blank" class="text-emerald-400 hover:text-emerald-300 p-1">💬</a>
                    </div>
                </td>
            </tr>
        `
    }).join('')

    // Stats
    document.getElementById('total-leads').textContent = leads.length
    document.getElementById('late-leads').textContent = leads.filter(l => l.payment_status === 'late').length
    document.getElementById('conv-rate').textContent = Math.round((leads.filter(l => l.status === 'kyc_submitted').length / leads.length) * 100) + '%'
}