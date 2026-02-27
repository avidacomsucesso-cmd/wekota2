/* 
  WEKOTA SPA ROUTER 
  Mantém a URL fixa em www.wekota.eu enquanto navega entre conteúdos.
*/

// Importa o CSS para o Vite processar
import './style.css';

const APP_CONTAINER_ID = 'spa-root';

// Mapeamento de rotas internas (opcional, mas ajuda na organização)
const routes = {
    '/': 'index.html',
    '/index.html': 'index.html',
    '/funil': 'funil-conversao.html',
    '/funil-conversao.html': 'funil-conversao.html',
    '/es': 'es.html',
    '/es.html': 'es.html',
    '/funil-es': 'funil-conversao-es.html',
    '/funil-conversao-es.html': 'funil-conversao-es.html',
    '/privacidade': 'politica-privacidade.html',
    '/termos': 'termos-condicoes.html',
    '/admin': 'admin.html'
};

/**
 * Carrega conteúdo de um arquivo HTML e injeta no container
 */
async function navigateTo(path) {
    const container = document.getElementById(APP_CONTAINER_ID);
    if (!container) return;

    // Se for a home, recarregamos a página inteira ou limpamos o container
    // Mas para manter a URL limpa, buscamos o conteúdo.
    const fileToLoad = routes[path] || path;

    try {
        const response = await fetch(fileToLoad);
        if (!response.ok) throw new Error('Falha ao carregar página');
        
        const html = await response.text();
        
        // Extrair apenas o conteúdo do <body> ou o HTML todo
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const content = doc.body.innerHTML;

        // Injetar conteúdo
        container.innerHTML = content;

        // Re-executar scripts encontrados no conteúdo injetado
        const scripts = container.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            if (oldScript.innerHTML) {
                newScript.innerHTML = oldScript.innerHTML;
            } else if (oldScript.src) {
                newScript.src = oldScript.src;
            }
            // Importante: scripts type module precisam ser tratados com cuidado
            document.body.appendChild(newScript);
            oldScript.remove();
        });

        // Atualizar ícones do Lucide se existirem
        if (window.lucide) window.lucide.createIcons();

        // Rolar para o topo
        window.scrollTo(0, 0);

        // Interceptar novos links injetados
        bindLinks();

    } catch (err) {
        console.error('Erro na navegação SPA:', err);
    }
}

/**
 * Intercepta todos os cliques em links internos
 */
function bindLinks() {
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        
        // Ignorar links externos, âncoras internas (#) ou links de whatsapp/tel
        if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('https://wa.me')) {
            return;
        }

        // Remover listener antigo para não duplicar
        link.onclick = (e) => {
            e.preventDefault();
            const targetPath = href.startsWith('./') ? href.substring(1) : href;
            navigateTo(targetPath);
        };
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    bindLinks();
    
    /* Sticky Header Logic original */
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header?.classList.add('header--scrolled');
        } else {
            header?.classList.remove('header--scrolled');
        }
    });
});

/* Carousel Logic (Movido para função global para re-init se necessário) */
window.initCarousels = function() {
    const track = document.querySelector('.carousel-track');
    const cards = document.querySelectorAll('.testimonial-card');
    let index = 0;

    if (!track || cards.length === 0) return;

    function slide() {
        index++;
        if (index > cards.length - 2) index = 0;
        const move = index * -50;
        if (window.innerWidth <= 768) {
            track.style.transform = `translateX(${index * -100}%)`;
        } else {
            track.style.transform = `translateX(calc(${move}% - ${index * 16}px))`;
        }
    }

    let carouselInterval = setInterval(slide, 4000);
    track.addEventListener('mouseenter', () => clearInterval(carouselInterval));
    track.addEventListener('mouseleave', () => carouselInterval = setInterval(slide, 4000));
};