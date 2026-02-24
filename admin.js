import { supabase } from './supabaseClient.js'

const loginScreen = document.getElementById('login-screen')
const adminContent = document.getElementById('admin-content')
const loginForm = document.getElementById('login-form')
const loginError = document.getElementById('login-error')
const logoutBtn = document.getElementById('logout-btn')
const leadsBody = document.getElementById('leads-body')

// Check session on load
supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
        showAdmin()
    }
})

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        loginError.style.display = 'block'
        loginError.textContent = error.message
    } else {
        showAdmin()
    }
})

logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut()
    loginScreen.style.display = 'flex'
    adminContent.style.display = 'none'
})

function showAdmin() {
    loginScreen.style.display = 'none'
    adminContent.style.display = 'block'
    fetchLeads()
}

async function fetchLeads() {
    const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching leads:', error)
        return
    }

    updateStats(leads)
    renderLeads(leads)
}

function updateStats(leads) {
    document.getElementById('total-leads').textContent = leads.length
    
    const today = new Date().toISOString().split('T')[0]
    const todayCount = leads.filter(lead => lead.created_at.startsWith(today)).length
    document.getElementById('today-leads').textContent = todayCount
}

function renderLeads(leads) {
    leadsBody.innerHTML = leads.map(lead => `
        <tr>
            <td>${new Date(lead.created_at).toLocaleDateString()}</td>
            <td>${lead.name || '-'}</td>
            <td>${lead.whatsapp || '-'}</td>
            <td>${lead.country || '-'}</td>
            <td>${lead.plan || '-'}</td>
            <td><span class="status-badge status-new">Novo</span></td>
            <td>
                <a href="https://wa.me/${lead.whatsapp?.replace(/\D/g,'')}" target="_blank" class="btn btn--primary" style="padding: 4px 12px; font-size: 0.8rem;">
                    WhatsApp
                </a>
            </td>
        </tr>
    `).join('')
}