const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

const crearToken = (usuario, secreta, expiresIn) => {
  const { id, email,nombre, apellido } = usuario;
  return jwt.sign( { id, email, nombre, apellido }, secreta, { expiresIn } )
}

//Resolvers
const resolvers = {
  Query:{
    obtenerUsuario: async(_, { token })=> {
      const usuarioId = await jwt.verify(token, process.env.SECRETA)
      return usuarioId
    },
    obtenerProductos: async() => {
      try {
        const productos = await Producto.find()
        return productos
      } catch (error) {
        console.log(error)
      }
    },
    obtenerProducto: async(_,{ id }) => {
      //revisar si el producto existe
      const producto = await Producto.findById(id);

      if(!producto) {
        throw new Error('Producto no encontrado');
      }
      return producto;
    }
  },

  Mutation:{
    nuevoUsuario:async(_,{ input })=>{
      const { email, password } = input;
      //Revisar si el usuario está registrado
      const existeUsuario = await Usuario.findOne({email});
      if(existeUsuario){
        throw new Error('El usuario ya está registrado')
      }
      //Hashear Pasword
      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);
      //Guardar BD
      try {
        const usuario = new Usuario(input);
        usuario.save();
        return usuario;
      } catch (error) {
        console.log(error)
      }
    },

    autenticarUsuario: async (_, {input}) => {
      const { email, password } = input;
      // Si el usuario existe
      const existeUsuario = await Usuario.findOne({email});
      if (!existeUsuario) {
          throw new Error('El usuario no existe');
      }
      // Revisar si el password es correcto
      const passwordCorrecto = await bcryptjs.compare( password, existeUsuario.password );
      if(!passwordCorrecto) {
          throw new Error('El Password es Incorrecto');
      }
      // Crear el token
      return {
          token: crearToken(existeUsuario, process.env.SECRETA, '8h' )
      }
    },

    nuevoProducto:async(_, {input}) => {
      try {
        const producto = new Producto(input);
        //almacenar en BD
        const resultado = await producto.save();
        return resultado;

      } catch (error) {
        console.log(error);
      }
    },
    actualizarProducto: async(_, { id, input }) => {
      //revisar si el producto existe
      let producto = await Producto.findById(id);

      if(!producto) {
        throw new Error('Producto no encontrado');
      }
      // guardar en BD
      producto = await Producto.findOneAndUpdate({ _id: id }, input, { new: true} );
      return producto
    },
    eliminarProducto: async(_,{id}) => {
       //revisar si el producto existe
       let producto = await Producto.findById(id);

       if(!producto) {
         throw new Error('Producto no encontrado');
       }
       //Eliminar
       await Producto.findByIdAndDelete( {_id : id});
       return "Producto eliminado";
    }
  }
}

module.exports = resolvers;