let cajas = 9;
const estanteria = document.getElementById('estanteria');
const repisas = document.querySelectorAll('.repisa');
const pantallaComputadora = document.querySelector('.pantalla-computadora');
const gridProductos = document.getElementById('grid-productos');

function crearCaja(repisa){
    const nuevaCaja = document.createElement('div');
    nuevaCaja.className = 'caja';

    const maxLeft = repisa.offsetWidth - 60;
    const maxTop = repisa.offsetHeight - 60;
    
    nuevaCaja.style.left = `${Math.random() * maxLeft}px`;
    nuevaCaja.style.top = `${Math.random() * maxTop}px`;

    repisa.appendChild(nuevaCaja);
    cajas++;

    anime({
        targets: nuevaCaja,
        scale: [0, 1],
        rotate: [anime.random(-180, 180), 0],
        duration: 800,
        easing: 'easeOutBack'
    });

    return nuevaCaja
}

function reproducirCajas() {
    if(cajas >= 30) return;
    
    const repisaAleatoria = repisas[Math.floor(Math.random() * repisas.length)];
    crearCaja(repisaAleatoria);
    
    setTimeout(reproducirCajas, anime.random(200, 400));
}

function efectoCaos() {
    return new Promise(resolve => {
        const animaciones = [];
        
        document.querySelectorAll('.caja').forEach(caja => {
            const repisa = caja.parentElement;
            const maxLeft = repisa.offsetWidth - 60;
            const maxTop = repisa.offsetHeight - 60;
            
            const animacion = anime({
                targets: caja,
                left: anime.random(0, maxLeft),
                top: anime.random(0, maxTop),
                rotate: anime.random(-360, 360),
                scale: anime.random(0.9, 1.1),
                duration: 2000,
                easing: 'easeInOutQuad',
                complete: () => {
                    if(Math.random() > 0.7) {
                        anime({
                            targets: caja,
                            top: estanteria.offsetHeight + 100,
                            duration: 1500,
                            easing: 'easeInQuad'
                        });
                    }
                }
            });
            animaciones.push(animacion.finished);
        })
        Promise.all(animaciones).then(resolve);
    });
}

function escaneoLaser() {
    return new Promise(resolve => {
        const laser = document.createElement('div');
        laser.className = 'laser';
        document.body.appendChild(laser)
        const estanteriaRect = estanteria.getBoundingClientRect();
        
        anime({
            targets: laser,
            left: [estanteriaRect.left - 100, estanteriaRect.right + 100],
            opacity: [0, 1, 0],
            duration: 2500,
            easing: 'linear',
            update: () => {
                document.querySelectorAll('.caja').forEach(caja => {
                    const cajaRect = caja.getBoundingClientRect();
                    const laserRect = laser.getBoundingClientRect();
                    
                    if(laserRect.left < cajaRect.right && 
                       laserRect.right > cajaRect.left &&
                       laserRect.top < cajaRect.bottom && 
                       laserRect.bottom > cajaRect.top) {
                        caja.classList.add('caja-escaneada');
                        setTimeout(() => caja.classList.remove('caja-escaneada'), 200);
                    }
                });
            },
            complete: () => {
                laser.remove();
                resolve();
            }
        });
    });
}

async function mostrarPantallaComputadora() {
    anime({
        targets: '#estanteria',
        scale: 0.5,
        opacity: 0,
        duration: 1000,
        easing: 'easeInOutQuad'
    })
    pantallaComputadora.style.display = 'block';
    
    anime({
        targets: pantallaComputadora,
        opacity: 1,
        scale: 1,
        translateX: '-50%',
        translateY: '-50%',
        duration: 1500,
        easing: 'easeOutElastic(1, .5)',
        begin: () => {
            pantallaComputadora.style.transform = 'translate(-50%, -50%) scale(0.8)';
        }
    })
    const maxItems = 15;
    gridProductos.innerHTML = ''
    document.querySelectorAll('.caja').forEach((caja, index) => {
        if(index < maxItems) {
            const item = crearItemProducto(index + 1);
            gridProductos.appendChild(item);
            
            anime({
                targets: item,
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 500,
                delay: index * 30,
                easing: 'easeOutExpo'
            });
        }
    })
    document.getElementById('contador-digital').textContent = cajas;
    document.getElementById('fecha-escaneo').textContent = 
        new Date().toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
    });
}

function crearItemProducto(id) {
    const item = document.createElement('div');
    item.className = 'item-producto';
    item.innerHTML = `
        <div class="codigo-barras"></div>
        <div>ID: ${id.toString().padStart(3, '0')}</div>
        <div>Stock: ${Math.floor(Math.random() * 50) + 1}</div>
    `;
    return item;
}

async function iniciar() {
    reproducirCajas();
    await new Promise(resolve => setTimeout(resolve, 3000));
    await efectoCaos();
    await escaneoLaser();
    await mostrarPantallaComputadora();
}

document.addEventListener('click', (e) => {
    if(e.target.closest('.pantalla-computadora')) {
        pantallaComputadora.style.display = 'none';
        gridProductos.innerHTML = '';
        document.querySelectorAll('.caja').forEach(c => c.remove());
        cajas = 9;
        document.getElementById('contador-numero').textContent = cajas;
        iniciar();
        anime({
            targets: '#estanteria',
            scale: 1,
            opacity: 1,
            duration: 800
        });
    }
});

iniciar()