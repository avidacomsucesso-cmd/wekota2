// Logic for Spanish Funnel
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://eczsqgtewtpcscsyvljy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjenNxZ3Rld3RwY3Njc3l2bGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjUxNTAsImV4cCI6MjA4NzU0MTE1MH0.HTXvOSk4Gjbg85YPfmWB59wKD943-wyjFd-iWeF9BUk';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

let currentLeadId = null;
let currentPos = 0;

async function fetchAndIncrementPos() {
    try {
        const months = document.querySelector('input[name="plan"]:checked').value;
        const column = months === '12' ? 'next_position_12_months' : 'next_position_24_months';
        
        const { data, error } = await supabase.from('funnel_settings').select(column).eq('id', 'current').single();
        if (error) throw error;
        
        const pos = data[column];
        
        // Increment for next
        await supabase.from('funnel_settings').update({ [column]: pos + 1 }).eq('id', 'current');
        
        return pos;
    } catch (e) {
        console.error(e);
        return 10;
    }
}

async function updateDynamicPos() {
    // This is just for preview/display if needed, but the actual assignment happens on submit
}

window.goToStep = (step) => {
    document.querySelectorAll('.funnel-card').forEach(c => c.classList.add('hidden'));
    document.getElementById(`step-${step}`).classList.remove('hidden');
    document.querySelectorAll('.step').forEach((s, i) => {
        s.classList.toggle('active', i + 1 === step);
        s.classList.toggle('completed', i + 1 < step);
    });
    window.scrollTo(0,0);
}

document.querySelectorAll('input[name="plan"]').forEach(input => {
    input.addEventListener('change', () => {
        updateDynamicPos();
        const price = input.value === '12' ? '149,00€' : '75,00€';
        document.getElementById('summary-price-es').innerText = price;
        document.getElementById('summary-total-es').innerText = price;
    });
});

document.getElementById('lead-form-es').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = 'Guardando...';
    btn.disabled = true;
    
    // Fetch and increment right when creating the lead
    currentPos = await fetchAndIncrementPos();
    
    const leadData = {
        name: document.getElementById('fullname').value,
        email: document.getElementById('email').value,
        whatsapp: document.getElementById('whatsapp').value,
        country: 'España',
        status: 'started',
        assigned_position: currentPos,
        plan: `iPhone 17 Pro Max - ${document.querySelector('input[name="plan"]:checked').value} meses`
    };

    const { data, error } = await supabase.from('leads').insert([leadData]).select();
    if (!error && data.length > 0) {
        currentLeadId = data[0].id;
        window.goToStep(3);
    } else {
        alert('Error al guardar datos. Intente nuevamente.');
        btn.innerText = 'Validar Datos';
    }
});

window.processKYC = async () => {
    const fileInput = document.getElementById('kyc-file-es');
    if (!fileInput.files[0]) return alert('Por favor, seleccione un documento.');
    
    const btn = document.getElementById('btn-kyc-es');
    btn.innerText = 'Subiendo...';
    
    const file = fileInput.files[0];
    const path = `kyc/${currentLeadId}/${Date.now()}_${file.name}`;
    
    const { error } = await supabase.storage.from('kyc-documents').upload(path, file);
    if (!error) {
        await supabase.from('leads').update({ status: 'kyc_submitted', passport_url: path }).eq('id', currentLeadId);
        window.goToStep(4);
    } else {
        alert('Error en la subida.');
        btn.innerText = 'Subir y Continuar';
    }
}

// File drop zone logic
const dropZone = document.getElementById('drop-zone-es');
const fileInput = document.getElementById('kyc-file-es');
const fileNameDisplay = document.getElementById('file-name-display-es');

if (dropZone) {
    dropZone.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        if (e.target.files.length > 0) {
            fileNameDisplay.innerText = `Arquivo selecionado: ${e.target.files[0].name}`;
            fileNameDisplay.classList.remove('hidden');
        }
    };
}

window.payWithStripe = async () => {
    const priceId = document.querySelector('input[name="plan"]:checked').value === '12' 
        ? 'price_1T4oJhEGWHer1k6evF1y6zR5' 
        : 'price_1T4oKuEGWHer1k6ed8oBXVap';

    const { data, error } = await supabase.functions.invoke('stripe-payments', {
        body: { 
            action: 'create-checkout-session',
            lead_id: currentLeadId,
            price_id: priceId,
            success_url: window.location.origin + '/es.html?status=success',
            cancel_url: window.location.origin + '/funil-conversao-es.html'
        }
    });

    if (data?.url) window.location.href = data.url;
    else alert('Error al iniciar pago.');
}

window.payWithTransfer = () => {
    window.location.href = `https://wa.me/34634773958?text=Hola%2C%20quiero%20pagar%20mi%20reserva%20por%20transferencia.%20Mi%20ID%3A%20${currentLeadId}`;
}

updateDynamicPos();