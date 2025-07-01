// server.js
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la base de datos
const sequelize = new Sequelize("databasel/r", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

// Modelo de Usuario
const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    secret: "tu_clave_secreta_aqui",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 horas
  })
);

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Rutas principales
app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

// Página de login
app.get("/login", (req, res) => {
  if (req.session.userId) {
    res.redirect("/dashboard");
  } else {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Arial', sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
            }
            .container { 
                background: white; 
                padding: 2rem; 
                border-radius: 10px; 
                box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
                width: 100%; 
                max-width: 400px; 
            }
            h2 { text-align: center; margin-bottom: 1.5rem; color: #333; }
            form { display: flex; flex-direction: column; }
            input { 
                padding: 0.8rem; 
                margin-bottom: 1rem; 
                border: 1px solid #ddd; 
                border-radius: 5px; 
                font-size: 1rem; 
            }
            button { 
                background: #667eea; 
                color: white; 
                padding: 0.8rem; 
                border: none; 
                border-radius: 5px; 
                font-size: 1rem; 
                cursor: pointer; 
                transition: background 0.3s; 
            }
            button:hover { background: #5a6fd8; }
            .link { text-align: center; margin-top: 1rem; }
            .link a { color: #667eea; text-decoration: none; }
            .link a:hover { text-decoration: underline; }
            .error { 
                background: #ffe6e6; 
                color: #d63031; 
                padding: 0.8rem; 
                border-radius: 5px; 
                margin-bottom: 1rem; 
                border: 1px solid #fab1a0; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Iniciar Sesión</h2>
            <form action="/login" method="POST">
                <input type="text" name="username" placeholder="Usuario o Email" required>
                <input type="password" name="password" placeholder="Contraseña" required>
                <button type="submit">Entrar</button>
            </form>
            <div class="link">
                <p>¿No tienes cuenta? <a href="/register">Regístrate aquí</a></p>
            </div>
        </div>
    </body>
    </html>
    `);
  }
});

// Página de registro
app.get("/register", (req, res) => {
  if (req.session.userId) {
    res.redirect("/dashboard");
  } else {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registro</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Arial', sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
            }
            .container { 
                background: white; 
                padding: 2rem; 
                border-radius: 10px; 
                box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
                width: 100%; 
                max-width: 400px; 
            }
            h2 { text-align: center; margin-bottom: 1.5rem; color: #333; }
            form { display: flex; flex-direction: column; }
            input { 
                padding: 0.8rem; 
                margin-bottom: 1rem; 
                border: 1px solid #ddd; 
                border-radius: 5px; 
                font-size: 1rem; 
            }
            button { 
                background: #667eea; 
                color: white; 
                padding: 0.8rem; 
                border: none; 
                border-radius: 5px; 
                font-size: 1rem; 
                cursor: pointer; 
                transition: background 0.3s; 
            }
            button:hover { background: #5a6fd8; }
            .link { text-align: center; margin-top: 1rem; }
            .link a { color: #667eea; text-decoration: none; }
            .link a:hover { text-decoration: underline; }
            .error { 
                background: #ffe6e6; 
                color: #d63031; 
                padding: 0.8rem; 
                border-radius: 5px; 
                margin-bottom: 1rem; 
                border: 1px solid #fab1a0; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Registro</h2>
            <form action="/register" method="POST">
                <input type="text" name="username" placeholder="Nombre de Usuario" required>
                <input type="email" name="email" placeholder="Email" required>
                <input type="password" name="password" placeholder="Contraseña" required>
                <input type="password" name="confirmPassword" placeholder="Confirmar Contraseña" required>
                <button type="submit">Registrarse</button>
            </form>
            <div class="link">
                <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a></p>
            </div>
        </div>
    </body>
    </html>
    `);
  }
});

// Dashboard (aquí rediriges a tu HTML)
app.get("/dashboard", requireAuth, (req, res) => {
  // CAMBIA 'dashboard.html' por el nombre de tu archivo HTML
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Procesamiento del login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ username: username }, { email: username }],
      },
    });

    if (!user) {
      return res.send(`
        <script>
          alert('Usuario no encontrado');
          window.location.href = '/login';
        </script>
      `);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.send(`
        <script>
          alert('Contraseña incorrecta');
          window.location.href = '/login';
        </script>
      `);
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error en login:", error);
    res.send(`
      <script>
        alert('Error del servidor');
        window.location.href = '/login';
      </script>
    `);
  }
});

// Procesamiento del registro
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.send(`
        <script>
          alert('Las contraseñas no coinciden');
          window.location.href = '/register';
        </script>
      `);
    }

    if (password.length < 6) {
      return res.send(`
        <script>
          alert('La contraseña debe tener al menos 6 caracteres');
          window.location.href = '/register';
        </script>
      `);
    }

    const existingUser = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ username: username }, { email: email }],
      },
    });

    if (existingUser) {
      return res.send(`
        <script>
          alert('El usuario o email ya existe');
          window.location.href = '/register';
        </script>
      `);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    req.session.userId = newUser.id;
    req.session.username = newUser.username;
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error en registro:", error);
    res.send(`
      <script>
        alert('Error del servidor');
        window.location.href = '/register';
      </script>
    `);
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
    }
    res.redirect("/login");
  });
});

// Inicializar servidor
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a MySQL establecida correctamente.");

    await sequelize.sync();
    console.log("Tablas sincronizadas.");

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
  }
}

startServer();
