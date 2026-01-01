// -------------------- DOM ELEMENTS --------------------
const cards = document.getElementById('cards');
const btnPublicar = document.getElementById('btnPublicar');
const buscar = document.getElementById('buscar');
const categoriaSelect = document.getElementById('categoria');
const loginForm = document.getElementById('loginForm');
const registroBtn = document.getElementById('registroBtn');
const loginBtn = document.getElementById('loginBtn');
const pantallaLogin = document.getElementById('pantallaLogin');
const pantallaPrincipal = document.getElementById('pantallaPrincipal');
const pantallaPublicar = document.getElementById('pantallaPublicar');
const pantallaPerfil = document.getElementById('pantallaPerfil');
const avatarPerfil = document.getElementById('avatarPerfil');
const nombreUsuario = document.getElementById('nombreUsuario');

// -------------------- STORAGE --------------------
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
let addons = JSON.parse(localStorage.getItem('addons')) || [];
let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

// -------------------- FUNCIONES USUARIO --------------------
function actualizarUserInfo() {
  if (usuarioActual) {
    avatarPerfil.src = usuarioActual.foto;
    nombreUsuario.textContent = usuarioActual.nombre;
  } else {
    avatarPerfil.src = 'img/default.png';
    nombreUsuario.textContent = '';
  }
}
actualizarUserInfo();

// REGISTRO
registroBtn.addEventListener('click', () => {
  const nombre = document.getElementById('regNombre').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const fotoInput = document.getElementById('regFoto');
  if (!nombre || !password || fotoInput.files.length === 0) { alert("Completa todos los campos"); return; }
  if (usuarios.find(u => u.nombre === nombre)) { alert("Nombre de usuario ya existe"); return; }

  const reader = new FileReader();
  reader.onload = function () {
    usuarios.push({ nombre, password, foto: reader.result });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    usuarioActual = { nombre, password, foto: reader.result };
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
    actualizarUserInfo();
    mostrarPantalla('pantallaPrincipal');
    limpiarFormulario();
    cargarAddons();
    alert("Usuario registrado y logueado!");
  }
  reader.readAsDataURL(fotoInput.files[0]);
});

// LOGIN
loginBtn.addEventListener('click', () => {
  const nombre = document.getElementById('logNombre').value.trim();
  const password = document.getElementById('logPassword').value.trim();
  const user = usuarios.find(u => u.nombre === nombre && u.password === password);
  if (user) {
    usuarioActual = user;
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
    actualizarUserInfo();
    pantallaLogin.style.display = 'none';
    mostrarPantalla('pantallaPrincipal');
    cargarAddons();
    alert("¡Bienvenido " + usuarioActual.nombre + "!");
  } else { alert("Usuario o contraseña incorrecta"); }
});

// CERRAR SESIÓN
function cerrarSesion() {
  usuarioActual = null;
  localStorage.removeItem('usuarioActual');
  actualizarUserInfo();
  pantallaLogin.style.display = 'block';
  pantallaPrincipal.style.display = 'none';
  pantallaPublicar.style.display = 'none';
  pantallaPerfil.style.display = 'none';
}

// EDITAR PERFIL
function editarPerfil() {
  const nuevoNombre = prompt("Nuevo nombre:", usuarioActual.nombre);
  if (!nuevoNombre) return;
  const nuevaContraseña = prompt("Nueva contraseña (dejar vacío si no cambia):", "");
  usuarioActual.nombre = nuevoNombre;
  if (nuevaContraseña) usuarioActual.password = nuevaContraseña;
  localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
  const index = usuarios.findIndex(u => u.nombre === usuarioActual.nombre);
  if (index >= 0) usuarios[index] = usuarioActual;
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  actualizarUserInfo();
  alert("Perfil actualizado!");
}

// -------------------- PANTALLAS --------------------
function mostrarPantalla(idPantalla) {
  pantallaPrincipal.style.display = 'none';
  pantallaPublicar.style.display = 'none';
  pantallaPerfil.style.display = 'none';
  document.getElementById(idPantalla).style.display = 'block';
}

// -------------------- PUBLICAR ADDON --------------------
btnPublicar.addEventListener('click', publicar);
buscar.addEventListener('input', () => cargarAddons(currentLista));

let currentLista = 'todos';

function publicar() {
  if (!usuarioActual) { alert("Debes iniciar sesión primero"); return; }
  const titulo = document.getElementById('titulo').value.trim();
  const link = document.getElementById('link').value.trim();
  const imagenInput = document.getElementById('imagen');
  const archivoInput = document.getElementById('archivoAddon');
  const categoria = categoriaSelect.value;
  const descripcion = document.getElementById('descripcion').value.trim();

  if (!titulo || !imagenInput.files.length || !archivoInput.files.length) { alert("Completa todos los campos"); return; }

  const readerImagen = new FileReader();
  const readerArchivo = new FileReader();

  readerImagen.onload = function () {
    readerArchivo.onload = function () {
      addons.push({
        titulo,
        categoria,
        descripcion,
        imagen: readerImagen.result,
        archivo: readerArchivo.result,
        archivoNombre: archivoInput.files[0].name,
        autor: usuarioActual.nombre
      });
      localStorage.setItem('addons', JSON.stringify(addons));
      limpiarFormulario();
      cargarAddons();
      alert("Addon publicado!");
    }
    readerArchivo.readAsDataURL(archivoInput.files[0]);
  }
  readerImagen.readAsDataURL(imagenInput.files[0]);
}

// -------------------- CARGAR ADDONS --------------------
function cargarAddons(lista = 'todos') {
  currentLista = lista;
  const filtro = buscar.value.toLowerCase();
  cards.innerHTML = '';
  let listaAddons = addons;

  if (lista === 'favoritos') listaAddons = favoritos.filter(f => f.usuario === usuarioActual.nombre);
  if (lista === 'creador') listaAddons = addons.filter(a => a.autor === usuarioActual.nombre);

  listaAddons.filter(item => item.titulo.toLowerCase().includes(filtro) || (item.descripcion || '').toLowerCase().includes(filtro))
    .forEach((item, index) => {
      let btnBorrar = '';
      let btnFavorito = '';
      if (usuarioActual) {
        if (item.autor === usuarioActual.nombre) btnBorrar = `<button onclick="borrarAddon(${index})">Borrar</button>`;
        const favIndex = favoritos.findIndex(f => f.titulo === item.titulo && f.autor === item.autor && f.usuario === usuarioActual.nombre);
        const favoritoActivo = favIndex >= 0;
        btnFavorito = `<button onclick="toggleFavorito(${index})">${favoritoActivo ? '❤️' : '🤍'} Favorito</button>`;
      }

      let btnDescargarArchivo = '';
      if (item.archivo) btnDescargarArchivo = `<a href="${item.archivo}" download="${item.archivoNombre}">Descargar archivo</a>`;

      cards.innerHTML += `
        <div class="card">
          <img src="${item.imagen}">
          <h3>${item.titulo} <span>[${item.categoria}]</span></h3>
          ${item.descripcion ? `<p>Qué trae: ${item.descripcion}</p>` : ''}
          <p>Autor: ${item.autor}</p>
          ${btnDescargarArchivo}
          ${btnBorrar}
          ${btnFavorito}
        </div>
      `;
    });
}

// -------------------- BORRAR ADDON --------------------
function borrarAddon(index) {
  if (confirm("¿Seguro quieres borrar este addon?")) {
    addons.splice(index, 1);
    localStorage.setItem('addons', JSON.stringify(addons));
    cargarAddons(currentLista);
  }
}

// -------------------- FAVORITOS --------------------
function toggleFavorito(index) {
  if (!usuarioActual) return;
  const item = addons[index];
  const favIndex = favoritos.findIndex(f => f.titulo === item.titulo && f.autor === item.autor && f.usuario === usuarioActual.nombre);
  if (favIndex >= 0) favoritos.splice(favIndex, 1);
  else favoritos.push({ ...item, usuario: usuarioActual.nombre });
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
  cargarAddons(currentLista);
}

function mostrarFavoritos() { cargarAddons('favoritos'); }
function mostrarCreador() { cargarAddons('creador'); }

// -------------------- EXPORT / IMPORT --------------------
function exportarAddons() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(addons));
  const a = document.createElement('a'); a.href = dataStr; a.download = "addons.json"; a.click();
}
function importarAddons(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const data = JSON.parse(e.target.result);
    addons = addons.concat(data);
    localStorage.setItem('addons', JSON.stringify(addons));
    cargarAddons(currentLista);
    alert("Addons importados!");
  }
  reader.readAsText(file);
}

// -------------------- LIMPIAR FORM --------------------
function limpiarFormulario() {
  document.getElementById('titulo').value = '';
  document.getElementById('link').value = '';
  document.getElementById('imagen').value = '';
  document.getElementById('archivoAddon').value = '';
  categoriaSelect.value = 'Mods';
  document.getElementById('descripcion').value = '';
}

// -------------------- INICIAL --------------------
cargarAddons();