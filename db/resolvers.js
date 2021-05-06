const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');

//Resolvers
const resolvers = {
  Query:{
    obtenerCurso: ()=> "Algo"
  },
  Mutation:{
    nuevoUsuario:async(_,{ input })=>{
      const { email, password } = input;
      //Revisar si el usuario está registrado
      const existeUsuario = await Usuario.findOne({email});
      if(existeUsuario){
        throw new Error ('El usuario ya está registrado')
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
    }
  }
}

module.exports = resolvers;