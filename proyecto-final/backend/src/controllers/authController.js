const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    console.log(`Intento de login con correo: '${correo}'`);
    const user = await prisma.usuario.findUnique({ where: { correo } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const validPassword = await bcrypt.compare(contrasena, user.contrasena_hash);
    if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id_usuario: user.id_usuario, rol: user.rol, id_empresa: user.id_empresa, nombre: user.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id_usuario, nombre: user.nombre, rol: user.rol } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario; // Provided by auth middleware
    const { correo, nuevaContrasena } = req.body;
    
    let updateData = {};
    if (correo) updateData.correo = correo;
    if (nuevaContrasena) {
      updateData.contrasena_hash = await bcrypt.hash(nuevaContrasena, 10);
    }
    
    const userUpdated = await prisma.usuario.update({
      where: { id_usuario },
      data: updateData
    });
    
    res.json({ message: 'Perfil actualizado con éxito', user: { id: userUpdated.id_usuario, nombre: userUpdated.nombre, rol: userUpdated.rol, correo: userUpdated.correo } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
